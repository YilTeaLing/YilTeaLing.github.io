const advisedMaxNumber: number = 1e10;
abstract class RealComputable {
    static addReal(a: RealComputable, b: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial {
        if (a instanceof Rational) {
            if (b instanceof Rational) return new Rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
            if (b instanceof Irrational) return Polynomial.Create(new Monomial(a, undefined, undefined), new Monomial(undefined, b, undefined));
            if (b instanceof Unknown) return Polynomial.Create(new Monomial(a, undefined, undefined), new Monomial(undefined, undefined, [b]));
            if (b instanceof Monomial)
                if (!b.hasIrrational && !b.hasUnkown) return a.add(b.rational);
                else return Polynomial.Create(new Monomial(a, undefined, undefined), b);
            if (b instanceof Polynomial) {
                for (var i1: number = 0; i1 < b.length(); i1++) {
                    if (!b.monomials[i1].hasIrrational && !b.monomials[i1].hasUnkown) {
                        b.monomials[i1] = new Monomial(<Rational>a.add(b.monomials[i1].rational));
                        return b;
                    }
                }
                b.monomials[i1 + 1] = new Monomial(a, undefined, undefined);
                return b;
            }
        }
        if (a instanceof Irrational) {
            if (b instanceof Rational) return b.add(a);
            if (b instanceof Irrational)
                if (a.equals(b)) return new Monomial(new Rational(2, 1, true), a, undefined);
                else return Polynomial.Create(new Monomial(undefined, a, undefined), new Monomial(undefined, b, undefined));
            if (b instanceof Unknown) return Polynomial.Create(new Monomial(undefined, a, undefined), new Monomial(undefined, undefined, [b]));
            if (b instanceof Monomial)
                if (a.equals(b.irrational)) return new Monomial(<Rational>b.rational.add(Rational.One), a, undefined);
                else return Polynomial.Create(new Monomial(undefined, a, undefined), b);
        }
        throw new Error("未定义的运算:add(" + a + "," + b + ")");
    }
    static mulReal(a: RealComputable, b: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial { return; }
    static equals(a: RealComputable, b: RealComputable): boolean {
        if (a instanceof Rational)
            if (b instanceof Rational)
                return a.self == b.self && a.divisor == b.divisor;
            else return false;
        if (a instanceof Irrational)
            if (b instanceof Irrational)
                return a.irrationalEquals(b);
            else return false;
        if (a instanceof Unknown)
            if (b instanceof Unknown)
                return a.symbol == b.symbol && a.exponent == b.exponent;
            else return false;
        if (a instanceof Monomial)
            if (b instanceof Monomial)
                return a.rational == b.rational && a.irrational == b.irrational && a.unknowns == b.unknowns;
            else return false;
        if (a instanceof Polynomial)
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < a.length(); i++)if (!a.monomials[i].equals(b.monomials[i])) return false;
                return true;
            }
        return false;
    }
    abstract Opp(): RealComputable;
    abstract Rec(): RealComputable;
    add(n: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial { return RealComputable.addReal(this, n); }
    min(n: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial { return this.add(n.Opp()); }
    mul(n: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial { { return RealComputable.mulReal(this, n); } }
    div(n: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial { return this.mul(n.Rec()); }
    equals(n: RealComputable): boolean { return RealComputable.equals(this, n); }
}
class Unknown extends RealComputable {
    public readonly symbol: string;
    public readonly exponent: number;
    constructor(s: string, e: number, v: boolean = false) {
        super();
        CheckNumber(e);
        if (s.length != 1) throw new Error("未知数的命名无效");
        this.symbol = s;
        if (v) this.exponent = t;
        else {
            var t: number = toInt(e);
            if (t == 0) throw new Error("将不会对未知数进行零次幂运算。请尝试改用\"1\"")
        }
    }
    Squ(): Unknown { return new Unknown(this.symbol, this.exponent * this.exponent, true); }
    Opp(): Monomial { return new Monomial(Rational.MinusOne, undefined, [this]); }
    Rec(): Unknown { return new Unknown(this.symbol, -this.exponent, true); }
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
    public readonly self: number;
    public readonly divisor: number;
    constructor(s: number, d: number, v?: boolean) {
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
abstract class Irrational extends RealComputable {
    public abstract irrationalEquals(n: Irrational): boolean;
    Opp(): Monomial { return new Monomial(Rational.MinusOne, this, undefined) }
    abstract Rec(): Monomial | Irrational;
}
class SpecialConst extends Irrational {
    public readonly exponent: number;
    public irrationalEquals(n: Irrational): boolean { return n instanceof SpecialConst && n.exponent == this.exponent && n.type == this.type; }
    Rec(): Irrational { return new SpecialConst(this.type, -this.exponent, true); }
    public readonly type: ConstType;
    constructor(t: ConstType = ConstType.Pi, e: number = 1, v: boolean = false) {
        super();
        CheckNumber(e);
        if (v) this.exponent = e; else {
            if (e == 0) throw new Error("将不会对特殊常量进行零次幂运算。请尝试改用\"1\"");
            var ei: number = toInt(e);
            this.exponent = ei;
        }
        this.type = t;
    }
}
const MaxSquareBase: number = 50;
(function () {
    SquareNumber = [];
    for (var i: number = 0; i < MaxSquareBase - 1; i++)
        SquareNumber[i] = (i + 2) * (i + 2);

})();
var SquareNumber: number[];
//function CreateSquareRoot(s: number): Monomial | SquareRoot | Rational { return SquareRoot.Create(s); }
class SquareRoot extends Irrational {
    public irrationalEquals(n: Irrational): boolean { return n instanceof SquareRoot && n.self == this.self; }
    Rec(): Monomial { return new Monomial(new Rational(1, this.self), this, undefined); }
    public readonly self: number;
    private constructor(s: number) {
        CheckNumber(s);
        super();
        this.self = s;
    }
    public static Create(s: number): Monomial | SquareRoot | Rational {
        CheckNumber(s);
        var index: number = 2;
        var cu: number = SquareNumber[0];
        var r: number = 1;
        while (cu <= s && index <= MaxSquareBase - 1) {
            if (s % cu == 0) {
                r *= index;
                s /= cu;
                if (s == 1) return new Rational(r, 1);
            } else {
                index++;
                cu = SquareNumber[index - 2];
            }
        }
        if (r == 1) return new SquareRoot(s);
        return new Monomial(new Rational(r, 1), new SquareRoot(s), undefined);
    }
}
enum ConstType { Pi }
class Monomial extends RealComputable {
    public hasRational(): boolean { return Rational.One.equals(this.rational); }
    public hasIrrational(): boolean { return this.irrational instanceof Irrational; }
    public hasUnkown(): boolean { return this.unknowns != undefined; }
    public readonly rational: Rational;
    public readonly irrational: Irrational;
    public readonly unknowns: Unknown[];
    constructor(r: Rational = Rational.One, i?: Irrational, u?: Unknown[]) {
        super();
        this.rational = r;
        this.irrational = i;
        if (u && u.length > 0)
            this.unknowns = u;
    }
    //static Create(r: Rational = Rational.One, i?: Irrational, ...u: Unknown[]): Rational | Irrational | Unknown[] | Monomial {
    //if (r.equals(Rational.Zero)) return r;
    //if (!r.equals(Rational.One)) {
    //    if (i instanceof Irrational || (u != undefined && u.length > 0)) return new Monomial(r, i, u);
    //     return r;
    // }
    //if (i instanceof Irrational)
    //     if ((u != undefined && u.length > 0))
    //         return new Monomial(r, i, u); else return i;
    //  if ((u != undefined && u.length > 0)) return u;
    //  throw new Error("无法构造无内容的单项式");
    // }
    Opp(): Monomial { return new Monomial(this.rational.Opp(), this.irrational, this.unknowns); }
    Rec(): Monomial {
        var nu: Unknown[] = this.unknowns;
        if (nu)
            for (var i: number; i < nu.length; i++)
                nu[i] = nu[i].Rec();
        return <Monomial>new Monomial(this.rational.Rec(), undefined, nu).mul(this.irrational.Rec());
    }
}
class Polynomial extends RealComputable {
    public readonly monomials: Monomial[];
    length(): number { return this.monomials.length; }
    private constructor(m: Monomial[]) {
        super();
        //if (!m || m.length <= 0) throw new Error("无法构造无内容的多项式");
        this.monomials = m;
    }
    static Create(...m: Monomial[]): Monomial | Polynomial {
        if (!m || m.length <= 0) throw new Error("无法构造无内容的多项式");
        if (m.length == 1) return m[0];
        return new Polynomial(m);
    }
    // static Create(m:Monomial[]):Monomial|Polynomial{return }
    Opp(): Polynomial {
        var nm: Monomial[] = this.monomials;
        if (nm) {
            for (var i: number; i < nm.length; i++)
                nm[i] = nm[i].Rec();
        }
        return new Polynomial(nm);
    }
    Rec(): Monomial {
        if (this.monomials && this.monomials.length == 1) return this.monomials[0].Rec();
        throw new Error("暂不支持取多项式倒数");
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