const { updateContact } = require("./contact");
const {
  fetchPatients,
  getGhlCustomfields,
  createNote,
} = require("../externalAPI/goHighLevel");
const bridgeModel = require("../model/bridgeEntity");
const { getPeople } = require("../externalAPI/clinicCore");
const {
  convertTimeFormatToGHL,
  reduceCustomFieldValue,
} = require("../util/helpers");

const getGhlFieldValue = async (contactId, fieldName) => {
  const {
    contact: { customFields = [] },
  } = await fetchPatients(contactId);
  const customFieldId = await getGhlCfIdByName(fieldName);
  return customFields.find((e) => e.id == customFieldId).value;
};

const getGhlCfIdByName = async (cfName) => {
  const { customFields } = await getGhlCustomfields();
  return customFields.find((e) => e.name == cfName).id;
};

const processPaymentCustomFields = async (contactId, data) => {
  try {
    const {
      invoicePayments = [],
      gross = 0,
      pdfUrl = null,
      createdAt = null,
    } = data.payload;
    const customFields = [];

    if (invoicePayments.length || gross) {
      const lastBalanceAmount = await getGhlFieldValue(contactId, "LTV");
      const paymentDone = invoicePayments.length
        ? invoicePayments.reduce((a, b) => a + b.gross, 0)
        : -gross;
      const newUpdatedBalance = lastBalanceAmount + paymentDone;

      customFields.push({ name: "LTV", values: [newUpdatedBalance] });

      const latestPayment = invoicePayments.length
        ? invoicePayments[invoicePayments.length - 1].gross
        : gross;
      customFields.push({ name: "LatestPaymentStatus", values: ["Success"] });
      customFields.push({
        name: "LatestAmountPaid",
        values: Math.abs(latestPayment),
      });
      customFields.push({
        name: "LatestPaymentDate",
        values: convertTimeFormatToGHL(createdAt),
      });
      customFields.push({ name: "LatestPaymentPDFURL", values: pdfUrl });
    }

    return customFields;
  } catch (err) {
    console.log("Error in process payment custom fields.", err);
  }
};

const processInvoiceCustomFields = async (contactId, data) => {
  try {
    const {
      pdfUrl = null,
      discount = 0,
      positions = [],
      payments = [],
      practicioner = null,
      diagnoses: _diagnoses,
    } = data.payload;
    const diagnoses = _diagnoses || [];
    const customFields = [];

    if (pdfUrl) {
      customFields.push({ name: "LatestInvoicePDFURL", values: [pdfUrl] });
    }

    if (positions.length) {
      const totalAmount = positions.reduce((a, b) => a + b.gross, 0);
      const totalDiscount = positions.reduce((a, b) => a + b.discount, 0);
      const productnames = [];
      positions.filter((ele) => {
        productnames.push(ele.name);
      });
      const diagnosisNames = [];
      diagnoses.filter((ele) => {
        diagnosisNames.push(ele.text);
      });
      const usersData = await getPeople();
      let doctorName = "";
      usersData.users.filter((ele) => {
        if (ele.id == practicioner) {
          doctorName = ele.shortName;
        }
      });

      customFields.push({ name: "GrossAmount", values: totalAmount });
      customFields.push({ name: "Discount", values: totalDiscount });
      customFields.push({
        name: "TotalAmount",
        values: totalAmount - totalDiscount - discount,
      });
      customFields.push({ name: "LTV", values: 0 });
      customFields.push({
        name: "LatestPaymentStatus",
        values: ["Invoice open"],
      });
      customFields.push({
        name: "Products",
        values: reduceCustomFieldValue(productnames),
      });
      customFields.push({
        name: "TheDiagnosis",
        values: reduceCustomFieldValue(diagnosisNames),
      });
      customFields.push({ name: "TreatedBy ", values: doctorName });
    }

    if (discount) {
      customFields.push({ name: "ExtraDiscount", values: discount });
    }

    // if (payments.length) {
    //     const lastBalanceAmount = await getGhlFieldValue(data.payload.patient, 'Balance Amount');
    //     const newUpdatedBalance = lastBalanceAmount - payments.reduce((a, b) => a + b.gross, 0)

    //     customFields.push({ name: "BalanceAmount", values: [newUpdatedBalance] });
    //     customFields.push({ name: "LatestAmountPaid", values: payments[payments.length - 1].gross });
    //     customFields.push({ name: "LatestPaymentStatus", values: ['Success'] });
    // }

    return customFields;
  } catch (err) {
    console.log("Error in process invoice custom fields.", err);
  }
};

const getContact = (uniqCCId) => {
  return bridgeModel.getbrigeEntity({ uniqCCId, type: "Contact" }) || {};
};

const updateInvoiceDetails = async (data) => {
  const { uniqGHLId: contactId } = await getContact(data.payload.patient);
  if (contactId) {
    const invoiceCustomFields = await processInvoiceCustomFields(
      contactId,
      data
    );
    console.log(
      "____Payload in updating extraFields Invoice______",
      invoiceCustomFields
    );

    await updateContact(contactId, invoiceCustomFields);

    let invoiceNote = `Invoice created: \n \t`;
    invoiceCustomFields.filter((ele) => {
      invoiceNote += `${ele.name} : ${ele.values} \n`;
    });
    const ghlNoteResponse = await createNote(contactId, invoiceNote);
    if (ghlNoteResponse) console.log("____Invoice Note Created______");
  } else {
    console.log("Patient was not found for update invoice.");
  }
};

const updatePaymentDetails = async (data) => {
  const { uniqGHLId: contactId } = await getContact(data.payload.patient);

  if (contactId) {
    const paymentCustomFields = await processPaymentCustomFields(
      contactId,
      data
    );
    console.log(
      "____Payload in updating extraFields Payment________",
      paymentCustomFields
    );

    await updateContact(contactId, paymentCustomFields);

    let paymentNote = `Payment Done: \n \t`;
    paymentCustomFields.filter((ele) => {
      paymentNote += `${ele.name} : ${ele.values} \n`;
    });
    const ghlNoteResponse = await createNote(contactId, paymentNote);
    if (ghlNoteResponse) console.log("____Payment Note Created______");
  } else {
    console.log("Patient was not found for update invoice.");
  }
};

module.exports = {
  updateInvoiceDetails,
  updatePaymentDetails,
};
