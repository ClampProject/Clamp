function translateConstant(constant) {
    switch (constant) {
        case 'top':
            return "0%";
        case 'left':
            return "0%";

        case 'bottom':
            return "100%";
        case 'right':
            return "100%";

        case 'center':
            return "50%";

        default:
            return constant;
    }
}

function generate(options) {
    const css = [];

    // do this so that options that are defined before others
    // will have priority
    // (ex: rotate before translate results in translate being based on rotation)
    for (const option in options) {
        switch (option) {
            case "translate": {
                if (options.translate.origin) {
                    css.push(`translateX(calc(${options.translate.x}px - ${translateConstant(options.translate.origin.x)}))`);
                    css.push(`translateY(calc(${options.translate.y}px - ${translateConstant(options.translate.origin.y)}))`);
                    break;
                }
                css.push(`translateX(${options.translate.x}px)`);
                css.push(`translateY(${options.translate.y}px)`);
                break;
            }
            case "skew": {
                css.push(`skewX(${options.skew.x}deg)`);
                css.push(`skewY(${options.skew.y}deg)`);
                break;
            }
            case "rotate": {
                css.push(`rotate(${options.rotate}deg)`);
                break;
            }
            default: {
                if (typeof options[option] === "object") {
                    const obj = options[option];
                    for (const prop in obj) {
                        css.push(`${option}${prop.toUpperCase()}(${obj[prop]})`);
                    }
                    break;
                }
                css.push(`${option}(${options[option]})`);
                break;
            }
        }
    }

    return css.join(' ');
}

export default generate;