
export const rgbToHex = (rgb: string): string => {
    const result = rgb.match(/\d+/g);
    if (result && result.length === 3) {
        const [r, g, b] = result.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
    return rgb;
};

export const indexToAlphabetHeaders = (index: number): string | undefined => {
    if (index === undefined || index < 0) return;

    let alphabets = '';
    while (index >= 0) {
        alphabets = String.fromCharCode(65 + (index % 26)) + alphabets;
        index = Math.floor(index / 26) - 1;
        if (index < 0) break;
    }
    return alphabets;
}
