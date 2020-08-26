const advisedMaxNumber = 1e10;
class Rational {
    self: number;
    divisor: number;
    constructor(s: number, d: number) {
        CheckNumber(s); CheckNumber(d);
        //if (isNaN(base) || isNaN(divsior)) throw Error("构造参数无效");
        if (d == 0) throw new Error("分母不能为0");
        if (s == 0) d = 1;
        else {
            if (d < 0) {
                d = -d;
                s = -s;
            }
            var gcd = GreatestCommonDivisor(s, d);
            s /= gcd;
            d /= gcd;
        }
        this.self = s;
        this.divisor = d;
    }
    Abs(): Rational { return new Rational(Math.abs(this.self), this.divisor); }
}
function GreatestCommonDivisor(a: number, b: number) {
    var c = a % b;
    if (c == 0) {
        return b;
    }
    return arguments.callee(b, c);
}
var ReachMaxWarning: Function;
function CheckNumber(n: number) {
    if (!isNaN(n) && Math.abs(n) > advisedMaxNumber && ReachMaxWarning.length == 1)
        ReachMaxWarning(n);
}