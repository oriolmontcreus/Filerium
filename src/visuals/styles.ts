export const buttonStyle = `
    background: #5688C7;
    color: white;
    padding: 10px 20px;
    border: 2px solid #333;
    border-radius: 12px;
    display: inline-block;
    transition: background-color 0.3s ease, transform 0.3s ease;
    cursor: pointer;
    margin: 4px 2px;
`;

export const buttonHoverStyle = `
    background: #416ba5;
    transform: scale(1.05);
`;

export const overlayStyle = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    user-select: none;
`;

export const contentStyle = `
    background: #252525;
    padding: 20px;
    border-radius: 12px;
    border: 3px solid #333;
    text-align: center;
`;

export const imagePreviewStyle = `
    max-width: 240px;
    max-height: 240px;
    margin-top: 10px;
    display: none;
    border: 3px solid #333;
    border-radius: 14px;
`;