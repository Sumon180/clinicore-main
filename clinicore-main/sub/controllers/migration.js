const {
  getPatients,
  getAppointment,
  getInvoices,
  getPayments,
} = require("../externalAPI/clinicCore");
const { createContact, getContact } = require("./contact");
const { updateInvoiceDetails, updatePaymentDetails } = require("./payment");
const { createNote } = require("../externalAPI/goHighLevel");
const {
  fetchAppointmentCustomFields,
  getUpdatePatient,
  getCalender,
  addTags,
  transformPayloadForAppointment,
  fixTitleOfGhlAppointment,
} = require("./appointment");

const contactMigration = async (pageNum, size) => {
  const patientsData = await getPatients(pageNum, size);
  patientsData.patients.filter(async (patient) => {
    const patientId = patient.id;
    const patientGhlId = await getContact(patientId);
    if (!patientGhlId) {
      const ghlContactId = await createContact(patient, [], true);
      if (ghlContactId) {
        if (patient.appointments.length) {
          patient.appointments.filter(async (appointmentId) => {
            const appointment = await getAppointment(appointmentId);
            await createAppointment(appointment.appointment, true);
          });
        }
      }
    }
  });
};

const migrateContact = async (req, res) => {
  const patientsData = await getPatients(1, 1);
  const totPatientCount = patientsData.meta.total;
  const perBatchCount = 10;
  let totPageNum = 1;
  const startForm = parseInt(req.query.startform) || 1;
  if (req.query.patients === "all") {
    totPageNum = parseInt(totPatientCount) / parseInt(perBatchCount);
  } else {
    totPageNum = req.query.patients / perBatchCount;
    if (startForm != 1) {
      totPageNum += parseInt(startForm);
    }
  }
  for (let i = startForm; i <= totPageNum; i++) {
    await contactMigration(i, perBatchCount);
  }
  return res
    .status(200)
    .send({ message: "Completed contacts migration process." });
};

const invoiceMigration = async (pagNum, size) => {
  const invoices = await getInvoices(pagNum, size);
  invoices.invoices.filter(async (invoiceData) => {
    const patientId = invoiceData.patient;
    const patientGhlId = await getContact(patientId);
    if (patientGhlId) {
      await updateInvoiceDetails({ payload: invoiceData });
      const paymentIds = [];
      invoiceData.payments.filter(async (payment) => {
        paymentIds.push(payment.id);
      });
      const params = {
        "ids[]": paymentIds,
      };
      const payments = await getPayments(params);
      payments.payments.filter(async (paymentData) => {
        if (paymentData.patient) {
          updatePaymentDetails({ payload: paymentData });
        }
      });
    }
  });
};

const migrateInvoice = async (req, res) => {
  const invoices = await getInvoices(1, 1);
  const totInvoicesCount = invoices.meta.total;
  const perBatchCount = 10;
  let totPageNum = 1;
  const startForm = parseInt(req.query.startform) || 1;
  if (req.query.invoices === "all") {
    totPageNum = parseInt(totInvoicesCount) / parseInt(perBatchCount);
  } else {
    totPageNum = req.query.invoices / perBatchCount;
    if (startForm != 1) {
      totPageNum += parseInt(startForm);
    }
  }
  for (let i = startForm; i <= totPageNum; i++) {
    await invoiceMigration(i, perBatchCount);
  }
  return res
    .status(200)
    .send({ message: "Completed Invoices migration process." });
};

const createAppointment = async (data, migration = false) => {
  try {
    const { uniqGHLId: appointmentId } = (await getAppointment(data.id)) || {};
    if (appointmentId) {
      console.log("_____already created appointment____", appointmentId);
      return;
    }

    const appointmentCustomFields = await fetchAppointmentCustomFields(data);
    console.log(
      "____Payload in creating extraFields Appointment______",
      appointmentCustomFields
    );

    const contactId = await getUpdatePatient(data, appointmentCustomFields);
    const calendarId = await getCalender(data);

    const contactTags = { tags: [] };
    appointmentCustomFields.filter((customField) => {
      if (customField.name == "Services") {
        contactTags.tags = customField.values;
      }
    });
    await addTags(contactId, contactTags);

    const payload = await transformPayloadForAppointment(
      data,
      "confirmed",
      contactId,
      calendarId
    );
    console.log("____Payload in creating Appointment______", payload);

    if (!migration) {
      const ghlResponse = await createAppointmentToGhl(payload);
      await saveBridgeEntity(data, ghlResponse);

      console.log("____Appointment Created______", payload);
    }
    const appointmentNote =
      "Appointment Booked: " + fixTitleOfGhlAppointment(data.title);
    const ghlNoteResponse = await createNote(contactId, appointmentNote);
    if (ghlNoteResponse) console.log("____Appointment Note Created______");
  } catch (err) {
    console.log("____Error in creating Appointment logs______", err);
  }
};

module.exports = {
  migrateContact,
  migrateInvoice,
};
