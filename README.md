# Filerium - Chromium based extension for enhanced file input control

![Filerium Logo](./src/images/filerium-w.svg)

**Filerium** enhances your file input experience in Chromium based browsers by intercepting file inputs and providing advanced clipboard integration. Stylish and functional, it ensures seamless file handling with a user-friendly interface.

## 🚀 Features

- **Intercept File Inputs:** Automatically intercepts and enhances file input elements on the page.
- **Clipboard Integration:** Detect and utilize clipboard contents, including images and text, as file inputs.
- **Preview Clipboard Contents:** Preview clipboard contents in a user-friendly manner. From png to svg, from text to html, gif and more.
- **User Customizable Colors:** Easily customizable primary, secondary, and action colors for a personalized experience.
- **Modern and Responsive UI:** Sleek overlay and button designs that look great on all devices.

## 🎥 Demo

![Demo GIF](./READMEassets/jack_nobg.gif)

## 🔧 Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/oriolmontcreus/filerium.git
    cd filerium
    ```

2. **Load unpacked extension in Chrome:**
    1. Navigate to `chrome://extensions/`.
    2. Enable "Developer mode" (top-right corner).
    3. Click "Load unpacked" and select the project directory.

## 🛠 Usage

1. **Activate Filerium:**
    - Upon visiting a webpage and clicking on a file input, Filerium will automatically intercept the file input and provide an advanced overlay.

2. **Clipboard Usage:**
    - Copy any supported content to your clipboard.
    - Upon clicking the file input, Filerium will detect clipboard contents and offer them as file input options.

3. **Customizing Colors:**
    - Filerium allows customization for primary, secondary, and action colors either through the extension default popup or by modifying the constants in `src/visuals/constants.ts`.

    ![Filerium Colors](./READMEassets/color-change.gif)

    ```typescript
    export const DEFAULT_PRIMARY_COLOR = '#252525'; //dark black
    export const DEFAULT_SECONDARY_COLOR = '#333333'; //dark gray
    export const DEFAULT_ACTION_COLOR = '#008CBA'; //blue
    ```

4. **Styling:**

    Modify styles in `src/visuals/styles.ts`:

    ```typescript
    export const buttonStyle = (color: string) => `
        padding: 10px;
        background-color: ${color};
        border: none;
        cursor: pointer;
        border-radius: 5px;
    `;
    // Additional styles...
    ```

## Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/my-new-feature`.
3. Commit your changes: `git commit -am 'Add some feature'`.
4. Push to the branch: `git push origin feature/my-new-feature`.
5. Submit a pull request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For inquiries or support, feel free to reach out at my LinkedIn or mail [omcdev9@gmail.com](mailto:omcdev9@gmail.com).
