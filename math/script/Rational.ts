const advisedMaxNumber: number = 1e10;
abstract class RealComputable {
    static AddReal(a:RealComputable,b:RealComputable):RealComputable{return;}
    static MinReal(a:RealComputable, b:RealComputable): RealComputable{return;}
    static MulReal(a:RealComputable, b:RealComputable):RealComputable{return;}
    static DivReal(a:RealComputable, b:RealComputable):RealComputable{return;}
    abstract Squ(): RealComputable;
    abstract Abs(): RealComputable;
    abstract Neg(): RealComputable;
    abstract Rec(): RealComputable;
    abstract Add(n: RealComputable): RealComputable;
    Min(n: RealComputable): RealComputable { return this.Add(n.Neg()); }
    abstract Mul(n: RealComputable): RealComputable;
    Div(n: RealComputable): RealComputable { return this.Mul(n.Rec());}
}
class Unknown extends RealComputable{
}
class Rational extends RealComputable {
    self: number;
    divisor: number;
    constructor(s: number, d: number) {
        super();
        CheckNumber(s); CheckNumber(d);
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
    Squ(): Rational { return new Rational(this.self*this.self, this. divisor);}
    Abs(): Rational { return new Rational(Math.abs(this.self), this.divisor); }
    Neg(): Rational { return new Rational(-this.self, this.divisor); }
    Rec(): Rational { return new Rational(this.divisor, this.self); }
}
abstract class Irrational extends RealComputable{}
class Monomial extends RealComputable{
    rational:Rational;
    irrational:Irrational;
    Squ(): RealComputable {
        throw new Error("Method not implemented.");
    }
    Abs(): RealComputable {
        throw new Error("Method not implemented.");
    }
    Neg(): RealComputable {
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
    if (!isNaN(n) && Math.abs(n) > advisedMaxNumber && ReachMaxWarning.length == 1)
        ReachMaxWarning(n);
}