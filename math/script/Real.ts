/*
Copyright © 2020 ll rights reserved.
Author: LonelyDagger, Passthem, Tealing
Released on teable.top/math
DONOT DISTRIBUTE! VIOLATORS WILL BE DEALT WITH ACCORDING TO LAW.
 */

const advisedMaxNumber: number = 1e10;
//弃用此方法，绝大部分本页定义类的实例的属性均为只读，不会改变
//多项式Polynomial除外，它只托管一个Monomial数组，因此输入计算的Polynomial对象的值可能会改变
/*function _deepcopy(object) {
    // 有些肯定是复制不了的
    return JSON.parse(JSON.stringify(object));
}*/
abstract class RealComputable {
    //进度: 已完成addReal(a,b)。
    static addReal(a: RealComputable, b: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial {
        if (a instanceof Rational) {
            //a，b均为有理数，分数通分加减法(Rational构造函数负责化简)
            if (b instanceof Rational) return new Rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
            //a有理数，b无理数，创建多项式
            if (b instanceof Irrational) return Polynomial.Create(new Monomial(a, undefined, undefined), new Monomial(undefined, b, undefined));
            //a有理数，b未知数，创建多项式
            if (b instanceof Unknown) return Polynomial.Create(new Monomial(a, undefined, undefined), new Monomial(undefined, undefined, [b]));
            //a有理数，b单项式
            if (b instanceof Monomial)
                //若b不含无理数和未知数，将有理数部分相加
                if (!b.hasIrrational() && !b.hasUnkown()) return a.add(b.rational);
                //否则创建多项式
                else return Polynomial.Create(new Monomial(a, undefined, undefined), b);
            //a有理数，b多项式
            if (b instanceof Polynomial) {
                //遍历b中每一项
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项不含无理数和未知数，将有理数部分相加
                    if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = new Monomial(<Rational>a.add(b.monomials[i].rational));
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i + 1] = new Monomial(a, undefined, undefined);
                return b;
            }
        }
        if (a instanceof Irrational) {
            //a无理数，b有理数，复用方法
            if (b instanceof Rational) return b.add(a);
            //a，b均为无理数，判断无理数是否相等，相等返回2a，否则创建多项式
            if (b instanceof Irrational)
                if (a.equals(b)) return new Monomial(new Rational(2, 1, true), a, undefined);
                else return Polynomial.Create(new Monomial(undefined, a, undefined), new Monomial(undefined, b, undefined));
            //a无理数，b未知数，创建多项式
            if (b instanceof Unknown) return Polynomial.Create(new Monomial(undefined, a, undefined), new Monomial(undefined, undefined, [b]));
            //a无理数，b单项式
            if (b instanceof Monomial)
                //若b中无理数等于a且不含未知数，将有理数部分+1
                if (a && a.equals(b.irrational) && !b.hasUnkown()) return new Monomial(<Rational>b.rational.add(Rational.One), a, undefined);
                //否则创建多项式
                else return Polynomial.Create(new Monomial(undefined, a, undefined), b);
            //a无理数，b多项式
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项无理数等于a且不含未知数，将有理数部分+1
                    if (b.monomials[i].irrational.equals(a) && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = new Monomial(<Rational>Rational.One.add(b.monomials[i].rational), a);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i + 1] = new Monomial(undefined, a, undefined);
                return b;
            }
        }
        if (a instanceof Unknown) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof Rational || b instanceof Irrational) return RealComputable.addReal(b, a);
            //a，b均为未知数，如果符号和指数相同，返回2a，否则创建多项式
            if (b instanceof Unknown)
                if (a.symbol == b.symbol && a.exponent == b.exponent) return new Monomial(new Rational(2, 1), undefined, [a]);
                else return Polynomial.Create(new Monomial(undefined, undefined, [a]), new Monomial(undefined, undefined, [b]));
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof Monomial)
                if (!b.hasIrrational && b.hasUnkown() && b.unknowns.length == 1 && b.unknowns[0].equals(a)) return new Monomial(<Rational>Rational.One.add(b.rational), undefined, [a]);
                else return Polynomial.Create(new Monomial(undefined, undefined, [a]), b);
            //a未知数，b多项式
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项不含无理数且未知数符号和指数等于a，将有理数部分+1
                    if (!b.monomials[i].hasIrrational() && b.monomials[i].hasUnkown() && b.monomials[i].unknowns.length == 1 && b.monomials[i].equals(a)) {
                        b.monomials[i] = new Monomial(<Rational>Rational.One.add(b.monomials[i].rational), undefined, [a]);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i + 1] = new Monomial(undefined, undefined, [a]);
                return b;
            }
        }
        if (a instanceof Monomial) {
            //a单项式，b为有理数或无理数或未知数，复用方法
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown) return RealComputable.addReal(b, a);
            //a，b均为单项式
            if (b instanceof Monomial) {
                //a，b无理数部分相同或不含无理数
                if ((a.hasIrrational() && b.hasIrrational() && a.irrational.equals(b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()))
                    //若a，b均含未知数且完全相同，或a，b均不含未知数，则将有理数部分相加
                    if (unknownEquals(a.unknowns, b.unknowns)) return new Monomial(<Rational>RealComputable.addReal(a.rational, b.rational), a.irrational, a.unknowns);
                //否则连接a，b创建多项式
                return Polynomial.Create(a, b);
            }
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
                    if (((a.hasIrrational() && b.monomials[i].hasIrrational() && a.irrational.equals(b.monomials[i].irrational)) || (!a.hasIrrational() && !b.monomials[i].hasIrrational())) && (unknownEquals(a.unknowns, b.monomials[i].unknowns))) {
                        b.monomials[i] = new Monomial(<Rational>a.rational.add(b.monomials[i].rational), a.irrational, a.unknowns);
                    }
                //否则在多项式中添加一项
                b.monomials[i + 1] = a;
                return b;
            }
        }
        //a为多项式，全部复用方法
        if (a instanceof Polynomial) return b.add(a);
        throw new Error("未定义的运算:add(" + a + "," + b + ")");
    }
    //进度: 未开始实现mulReal(a,b)。
    static mulReal(a: RealComputable, b: RealComputable): Rational | Irrational | Unknown[] | Monomial | Polynomial { return; }
    //进度: 已完成equals(a,b)。
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
function unknownEquals(a: Unknown[], b: Unknown[]) {
    if (a != undefined && a.length > 0) {
        if (b && a.length == b.length) {
            for (var i: number = 0; i < a.length; i++)
                if (!a[i].equals(b[i])) return false;
            return true;
        }
        return false;
    }
    return b == undefined || b.length <= 0;
}
class Unknown extends RealComputable {
    public readonly symbol: string;
    public readonly exponent: number;
    constructor(s: string, e: number, v: boolean = false) {
        super();
        CheckNumber(e);
        this.symbol = s;
        if (v) this.exponent = t;
        else {
            if (!s || s.length != 1) throw new Error("未知数的命名无效");
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
//弃用以下方法以提升性能。不推荐使用JSON处理
/*function value_equal(objectA: any, objectB: any) {
    try {
        if (JSON.stringify(objectA) == JSON.stringify(objectB)) return true;
    } catch (err) {
        if (objectA == objectB) return true;
    }
    return false;
}
function _python_in(object: any, list: any[]) {
    // 一个Python的语句，我用惯了，在TS里实现一下
    for (var index = 0; index < list.length; index++) {
        if (value_equal(object, list[index])) return true
    }
    return false;
}
function intersection(listA: any[], listB: any[]) {
    var _intersection = [];
    for (var index = 0; index < listA.length; index++) {
        if (_python_in(listA[index], listB) && !_python_in(listA[index], _intersection)) {
            _intersection.push(listA[index]);
        }
    }
    return _intersection;
}*/
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
    public hasRational(): boolean { return !Rational.One.equals(this.rational); }
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