export const buttonStyle = (backgroundColor: string) => `
    background-color: ${backgroundColor};
    border: none;
    border-radius: 12px;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    transition: all 0.3s ease;
`;

export const buttonHoverStyle = `
    filter: brightness(0.8);
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
    background-color: #252525;
    padding: 20px;
    text-align: center;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
    border-radius: 12px;
    border: 3px solid #333;
    color: #fff;
`;

export const imagePreviewStyle = `
    width: 100%;
    height: auto;
    max-width: 70%;
    max-height: 55vh;
    display: block;
    margin: auto;
    object-fit: contain;
`;

export const textPreviewStyle = `
    max-width: 100%;
    max-height: 230px;
    overflow: auto;
    border-radius: 12px;
    color: #fff;
    margin: 0;
`;

export const filePreviewStyle = `
    max-width: 100%;
    max-height: 90vh;
    background-color: #333;
    color: #fff;
    padding: 10px;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    margin-top: 10px;
`;

export const DEFAULT_ACTION_COLOR = '#5688C7';