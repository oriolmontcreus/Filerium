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

export const contentStyle = (primaryColor: string) => `
    background-color: ${primaryColor};
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

export const filePreviewStyle = (secondaryColor: string) => `
    max-width: 100%;
    max-height: 90vh;
    background-color: ${secondaryColor};
    color: #fff;
    padding: 10px;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    margin-top: 10px;
`;

export const filenameInputStyle = (secondaryColor: string, primaryColor: string) => `
    display: inline-block;
    border-radius: 10px;
    outline: 2px solid ${primaryColor};
    border: 0;
    color: #fff;
    background-color: ${secondaryColor};
    outline-offset: 3px;
    padding: 10px 1rem;
    transition: 0.25s;
`  