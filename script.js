// Select DOM elements and store them in variables
const balance = document.getElementById("balance"); // Element to display the total balance
const money_plus = document.getElementById("money-plus"); // Element to display total income
const money_minus = document.getElementById("money-minus"); // Element to display total expenses
const list = document.getElementById("list"); // Element to display the transaction history
const form = document.getElementById("form"); // Form element for adding new transactions
const text = document.getElementById("text"); // Input field for transaction description
const amount = document.getElementById("amount"); // Input field for transaction amount
const ctx = document.getElementById('myChart').getContext('2d'); // Get the 2D context for the chart

// Initialize transactions from localStorage or set to empty array if not present
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Initialize Chart.js with default configuration
let myChart = new Chart(ctx, {
  type: 'line', // Chart type
  data: {
    labels: [], // Labels for the x-axis (e.g., transaction descriptions)
    datasets: [{
      label: 'Expenses and Income', // Label for the dataset
      data: [], // Data points for the y-axis
      borderColor: 'rgba(0, 0, 0, 1)', // Line color for the chart
      backgroundColor: 'rgba(0, 0, 0, 0.2)', // Background color for the chart (for line charts, it affects the fill)
      fill: false, // No fill under the line
    }]
  },
  options: {
    responsive: true, // Make the chart responsive
    scales: {
      x: {
        title: {
          display: true,
          text: 'Transaction' // Title for the x-axis
        },
        ticks: {
          color: 'black' // Color of the x-axis labels
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount' // Title for the y-axis
        },
        ticks: {
          color: 'black' // Color of the y-axis labels
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'black' // Color of the legend text
        }
      }
    }
  }
});

// Function to add a new transaction
function addTransaction(e) {
  e.preventDefault(); // Prevent the default form submission behavior
  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add text and amount'); // Alert if fields are empty
  } else {
    const transaction = {
      id: generateID(), // Generate a unique ID for the transaction
      text: text.value, // Get the description from the input field
      amount: +amount.value // Convert the amount to a number and get the value
    };

    transactions.push(transaction); // Add the new transaction to the transactions array
    addTransactionDOM(transaction); // Update the DOM with the new transaction
    updateValues(); // Update balance, income, and expense values
    updateLocalStorage(); // Save transactions to localStorage
    updateChart(); // Update the chart with new data
    text.value = ''; // Clear the description input field
    amount.value = ''; // Clear the amount input field
  }
}

// Function to generate a unique ID for a transaction
function generateID() {
  return Math.floor(Math.random() * 1000000000); // Random ID between 0 and 1 billion
}

// Function to add a transaction to the DOM
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+"; // Determine the sign based on the amount
  const item = document.createElement("li"); // Create a new list item

  // Add a class based on whether the transaction is income or expense
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");
  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span>
    <button class="delete-btn">x</button>
  `; // Set the HTML content of the list item
  list.appendChild(item); // Append the new item to the list

  // Add event listener to the delete button
  item.querySelector('.delete-btn').addEventListener('click', () => removeTransaction(transaction.id));
}

// Function to update the balance, income, and expense values
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount); // Extract amounts from transactions
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2); // Calculate total balance
  const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0).toFixed(2); // Calculate total income
  const expense = (amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2); // Calculate total expenses

  // Update the balance, income, and expense elements
  balance.innerText = `$${total}`;
  money_plus.innerText = `$${income}`;
  money_minus.innerText = `$${expense}`;
}

// Function to remove a transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id); // Filter out the transaction with the specified ID
  updateLocalStorage(); // Save the updated transactions to localStorage
  Init(); // Reinitialize the app to update the UI
}

// Function to update localStorage with the current transactions
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions)); // Convert transactions array to JSON and store it
}

// Function to initialize the app
function Init() {
  list.innerHTML = ""; // Clear the list element
  transactions.forEach(addTransactionDOM); // Add each transaction to the DOM
  updateValues(); // Update the balance, income, and expense values
  updateChart(); // Update the chart with the current data
}

// Function to update the chart with the latest data
function updateChart() {
  const labels = transactions.map(transaction => transaction.text); // Extract labels from transactions
  const data = transactions.map(transaction => transaction.amount); // Extract data from transactions

  myChart.data.labels = labels; // Update chart labels
  myChart.data.datasets[0].data = data; // Update chart data

  // Determine the chart colors based on the net balance
  const netBalance = data.reduce((acc, val) => acc + val, 0);
  myChart.data.datasets[0].borderColor = netBalance >= 0 ? 'rgba(46, 204, 113, 1)' : 'rgba(192, 57, 43, 1)'; // Set border color based on net balance
  myChart.data.datasets[0].backgroundColor = netBalance >= 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(192, 57, 43, 0.2)'; // Set background color based on net balance

  myChart.update(); // Update the chart to reflect changes
}

// Function to change the background color of the page every 10 seconds
function changeBackgroundColor() {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A5', '#FF8C33']; // Array of colors
  document.body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; // Set a random background color
  setTimeout(changeBackgroundColor, 10000); // Schedule the next color change
}

// Initialize the app and set up event listeners
changeBackgroundColor(); // Start changing background color
Init(); // Initialize the app
form.addEventListener('submit', addTransaction); // Add event listener to the form for adding new transactions
