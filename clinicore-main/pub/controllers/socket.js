const { publishToQueue } = require("../util/queue");

const handleCreateEvent = async (eventData) => {
  try {
    if (eventData) {
      console.log("Patient", eventData);
      console.log("Patient", JSON.stringify(eventData));
      publishToQueue({ CCEvent: { createEvent: eventData } });
    } else {
      console.log("Invalid create-event data format");
    }
  } catch (err) {
    console.log('Something went wrong in create-event handler', err);
  }
};

const handleUpdateEvent = async (eventData) => {
  try {
    if (eventData) {
      console.log("Appointment Updated", eventData);
      console.log("Appointment Updated", JSON.stringify(eventData));
      publishToQueue({ CCEvent: { updateEvent: eventData } });
    } else {
      console.log("Invalid update-event data format");
    }
  } catch (err) {
    console.log('Something went wrong in update-event handler');
  }
};

const handleAppointmentCreateEvent = async (eventData) => {
  try {
    if (eventData) {
      console.log("Appointment", eventData);
      console.log("Appointment", JSON.stringify(eventData));
      publishToQueue({ CCEvent: { createEvent: eventData } });
    } else {
      console.log('Invalid appointment create-event data format');
    }
  } catch (err) {
    console.log('Something went wrong in create-appointment event handler');
  }
};

const handleDeleteEvent = async (eventData) => {
  try {
    if (eventData) {
      console.log("Appointment Delete", eventData);
      console.log("Appointment Delete", JSON.stringify(eventData));
      publishToQueue({ CCEvent: { deleteEvent: eventData } });
    } else {
      console.log("Invalid delete-event data format");
    }
  } catch (err) {
    console.log('Something went wrong in delete-event handler');
  }
};


module.exports = {
  handleCreateEvent,
  handleAppointmentCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent
};
