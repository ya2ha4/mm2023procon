export type EasingFunc = (value: number) => number;

export function easelinear(value: number): number {
    return value;
}

export function easeInExpo(value: number): number {
    return value != 0 ? Math.pow(2, 10 * value - 10) : 0;
}

export function easeOutExpo(value: number): number {
    return value != 1 ? 1 - Math.pow(2, -10 * value) : 1;
}

export function easeInOutExpo(value: number): number {
    if (value == 0) {
        return 0;
    }
    if (value == 1) {
        return 1;
    }

    return value < 0.5 ? Math.pow(2, 20 * value - 10) / 2 : (2 - Math.pow(2, -20 * value + 10)) / 2;
}

export function easeInQuart(value: number): number {
    return Math.pow(value, 4);
}

export function easeOutQuart(value: number): number {
    return 1 - Math.pow(1 - value, 4);
}
