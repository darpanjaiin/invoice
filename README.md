# AI Invoice Creator

A mobile-friendly web application for creating invoices using voice or text input. Perfect for small businesses looking to streamline their invoicing process.

## Features

- Voice input for quick invoice creation
- Text-based input option
- Business profile management
- Professional PDF invoice generation
- Mobile-responsive design
- Local storage for settings and data
- Simple authentication system

## Prerequisites

- Node.js (v12 or higher)
- npm (comes with Node.js)
- Modern web browser (Chrome recommended for voice input)

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Usage

1. Sign up with your email (demo mode - no actual authentication)
2. Configure your business settings
3. Create invoices using either:
   - Voice input (e.g., "Sold 3 units of product A to Mr. John for Rs. 100 each")
   - Manual form input
4. Download generated PDF invoices

## Voice Input Format

For best results, use the following format:
```
"Sold [quantity] units of [product] to [customer] for Rs. [price] each"
```

Example: "Sold 3 units of product A to Mr. John for Rs. 100 each"

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Speech API
- jsPDF for PDF generation
- Express.js for serving static files

## License

MIT 