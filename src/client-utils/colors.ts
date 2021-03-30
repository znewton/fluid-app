export const genRandomCSSHexColor = (floor = 0): string =>
    `#${Math.floor(floor + (0xffffff - floor) * Math.random()).toString(16)}`;

class ColorMap extends Map<string, string> {
    public set(key: string, value?: string) {
        super.set(key, value ?? genRandomCSSHexColor());
        return this;
    }

    public getOrSet(key: string, floor?: number): string | undefined {
        return (
            this.get(key) ?? this.set(key, genRandomCSSHexColor(floor)).get(key)
        );
    }
}

export const colorMap = new ColorMap();
