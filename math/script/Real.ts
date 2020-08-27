const advisedMaxNumber: number = 1e10;
abstract class RealComputable {
    static AddReal(a: RealComputable, b: RealComputable): RealComputable { return; }
    static MulReal(a: RealComputable, b: RealComputable): RealComputable { return; }
    abstract Squ(): RealComputable;
    abstract Opp(): RealComputable;
    abstract Rec(): RealComputable;
    Add(n: RealComputable): RealComputable { return RealComputable.AddReal(this, n); }
    Min(n: RealComputable): RealComputable { return this.Add(n.Opp()); }
    Mul(n: RealComputable): RealComputable { { return RealComputable.MulReal(this, n); } }
    Div(n: RealComputable): RealComputable { return this.Mul(n.Rec()); }
}
class Unknown extends RealComputable {
    readonly symbol: string;
    readonly exponent: number;
    constructor(s: string, e: number, private v?: boolean) {
        super();
        CheckNumber(e);
        if (s.length != 1) throw new Error("未知数的命名无效");
        this.symbol = s;
        if (v) this.exponent = t;
        else {
            var t: number = toInt(e);
            if (t == 0) throw new Error("将不会对未知数进行零次幂运算。请使用\"1\"代替")
        }
    }
    Squ(): Unknown { return new Unknown(this.symbol, this.exponent * this.exponent, true); }
    Opp(): Monomial { return new Monomial(); }
    Rec(): RealComputable {
        throw new Error("Method not implemented.");
    }
}
function toInt(o: number): number {
    var i = o.toString().indexOf('.');
    if (i >= 0) throw new Error("暂不支持非整数的指数");
    return o;
}
class Rational extends RealComputable {
    public static readonly One: Rational = new Rational(1, 1, true);
    public static readonly Zero: Rational = new Rational(0, 1, true);
    public static readonly MinusOne: Rational = new Rational(-1, 1, true);
    readonly self: number;
    readonly divisor: number;
    constructor(s: number, d: number, private v?: boolean) {
        super();
        CheckNumber(s); CheckNumber(d);
        if (!v) {
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
        }
        this.self = s;
        this.divisor = d;
    }
    Squ(): Rational { return new Rational(this.self * this.self, this.divisor); }
    Abs(): Rational { return new Rational(Math.abs(this.self), this.divisor); }
    Opp(): Rational { return new Rational(-this.self, this.divisor); }
    Rec(): Rational { return new Rational(this.divisor, this.self); }
}
abstract class Irrational extends RealComputable { }
class Monomial extends RealComputable {
    readonly rational: Rational;
    readonly irrational: Irrational;
    readonly unknowns : Unknown[];
    Squ(): RealComputable {  
        throw new Error("Method not implemented.");
    }
    Abs(): RealComputable {
        throw new Error("Method not implemented.");
    }
    Opp(): RealComputable {
        throw new Error("Method not implemented.");
    }
    Rec(): RealComputable {
        throw new Error("Method not implemented.");
    }
    Add(n: RealComputable): RealComputable {
        throw new Error("Method not implemented.");
    }
    Mul(n: RealComputable): RealComputable {
        throw new Error("Method not implemented.");
    }
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
    if (!isNaN(n) && Math.abs(n) > advisedMaxNumber && ReachMaxWarning && ReachMaxWarning.length == 1)
        ReachMaxWarning(n);
}