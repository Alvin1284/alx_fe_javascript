// Array to store quotes with text and category
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Wisdom" }
];

// Function to display a random quote
function showRandomQuote() {
  // Select a random quote from the array
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  
  // Get the quote display element
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Create or update the quote display dynamically
  quoteDisplay.innerHTML = `
    <p style="font-size: 18px; font-style: italic; margin: 20px 0;">
      "${randomQuote.text}"
    </p>
    <p style="font-weight: bold; color: #555;">
      Category: ${randomQuote.category}
    </p>
  `;
}

// Function to add a new quote
function addQuote() {
  // Get input values
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  // Validate inputs
  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both a quote and a category!');
    return;
  }
  
  // Create new quote object and add to array
  const newQuote = {
    text: newQuoteText,
    category: newQuoteCategory
  };
  
  quotes.push(newQuote);
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Show confirmation message
  alert('Quote added successfully!');
  
  // Optionally display the newly added quote
  showRandomQuote();
}

// Function to create add quote form dynamically (for advanced DOM manipulation)
function createAddQuoteForm() {
  // Check if form already exists to avoid duplicates
  const existingForm = document.getElementById('addQuoteForm');
  if (existingForm) {
    return;
  }
  
  // Create form container
  const formDiv = document.createElement('div');
  formDiv.id = 'addQuoteForm';
  formDiv.style.marginTop = '30px';
  formDiv.style.padding = '20px';
  formDiv.style.border = '1px solid #ccc';
  formDiv.style.borderRadius = '5px';
  formDiv.style.backgroundColor = '#f9f9f9';
  
  // Create heading
  const heading = document.createElement('h3');
  heading.textContent = 'Add Your Own Quote';
  formDiv.appendChild(heading);
  
  // Create quote text input
  const quoteInput = document.createElement('input');
  quoteInput.id = 'dynamicQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';
  quoteInput.style.width = '100%';
  quoteInput.style.padding = '10px';
  quoteInput.style.marginBottom = '10px';
  quoteInput.style.boxSizing = 'border-box';
  formDiv.appendChild(quoteInput);
  
  // Create category input
  const categoryInput = document.createElement('input');
  categoryInput.id = 'dynamicQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';
  categoryInput.style.width = '100%';
  categoryInput.style.padding = '10px';
  categoryInput.style.marginBottom = '10px';
  categoryInput.style.boxSizing = 'border-box';
  formDiv.appendChild(categoryInput);
  
  // Create submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Add Quote';
  submitButton.style.padding = '10px 20px';
  submitButton.style.backgroundColor = '#4CAF50';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '3px';
  submitButton.style.cursor = 'pointer';
  
  // Add click event listener
  submitButton.addEventListener('click', function() {
    const quoteText = document.getElementById('dynamicQuoteText').value.trim();
    const quoteCategory = document.getElementById('dynamicQuoteCategory').value.trim();
    
    if (quoteText === '' || quoteCategory === '') {
      alert('Please enter both a quote and a category!');
      return;
    }
    
    // Add quote to array
    quotes.push({
      text: quoteText,
      category: quoteCategory
    });
    
    // Clear inputs
    document.getElementById('dynamicQuoteText').value = '';
    document.getElementById('dynamicQuoteCategory').value = '';
    
    // Show success message
    alert('Quote added successfully!');
    
    // Display the new quote
    showRandomQuote();
  });
  
  formDiv.appendChild(submitButton);
  
  // Append form to body
  document.body.appendChild(formDiv);
}

// Event listener for the "Show New Quote" button
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to the new quote button
  const newQuoteButton = document.getElementById('newQuote');
  newQuoteButton.addEventListener('click', showRandomQuote);
  
  // Display an initial quote when the page loads
  showRandomQuote();
  
  // Optional: Uncomment the line below to create the form dynamically
  // createAddQuoteForm();
});
