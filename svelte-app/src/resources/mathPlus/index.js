// epic advanced math :O

class MathPlus {
    static tanDeg(deg) {
        deg = deg % 360;
        return Math.round(Math.tan((Math.PI * deg) / 180) * 1e10) / 1e10;
    }
}

export default MathPlus;