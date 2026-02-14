
let tickets = []; // Initialize the tickets array

export const setTickets = (ticket) => {
    if (tickets.length >= 5) {
        // If there are already 5 tickets, remove the oldest one (first one in the array)
        tickets.shift();
    }
    // Add the new ticket (ticket) to the array
    tickets.push(ticket);
};

export const getTickets = () => {
    return tickets; // Returns the array of tickets
};
