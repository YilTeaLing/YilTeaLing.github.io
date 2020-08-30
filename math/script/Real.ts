/*
Copyright © 2020 ll rights reserved.
Author: LonelyDagger, Passthem, Tealing
Released on teable.top/math
DONOT DISTRIBUTE! VIOLATORS WILL BE DEALT WITH ACCORDING TO LAW.
 */
const advisedMaxNumber: number = 1e10;
// {I don't know how many} Errors left. Old version file: Real.old.ts(No errors but with less expansibility and implement)
function copyObject<T extends object>(origin: T): T { return Object.create(origin).__proto__; }
abstract class RealComputable {
    static addReal(a: RealComputable, b: RealComputable): RealComputable {
        if (b == undefined) return a;
        if (a instanceof Rational) {
            //a，b均为有理数，分数通分加减法(Rational构造函数负责化简)
            if (b instanceof Rational) return new Rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
            //a有理数，b无理数/未知数，创建多项式
            if (b instanceof Irrational || b instanceof IrrationalItem || b instanceof Unknown || b instanceof UnknownItem) return Polynomial.create(Monomial.create(a), Monomial.create(b));
            if (b instanceof ConstItem)
                if (b.hasIrrational()) return Polynomial.create(Monomial.create(a), Monomial.create(b));
                else return RealComputable.addReal(a, b.rational);
            //a有理数，b单项式
            if (b instanceof Monomial)
                //若b不含无理数和未知数，将有理数部分相加
                if (!b.hasIrrational() && !b.hasUnkown()) return RealComputable.addReal(a, b.const.rational);
                //否则创建多项式
                else return Polynomial.create(Monomial.create(a), b);
            //a有理数，b多项式
            if (b instanceof Polynomial) {
                //遍历b中每一项
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项不含无理数和未知数，将有理数部分相加
                    if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = Monomial.create(<Rational>RealComputable.addReal(a, b.monomials[i].const.rational));
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = Monomial.create(a);
                return b;
            }
        }
        if (a instanceof Irrational) {
            //a无理数，b有理数，复用方法
            if (b instanceof Rational) return b.add(a);
            //a，b均为无理数，判断无理数是否相等，相等返回2a，否则创建多项式
            if (b instanceof Irrational)
                if (a.equals(b)) return Monomial.createComplete(new Rational(2, 1, true), [a], undefined);
                else return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a无理数，b未知数，创建多项式
            if (b instanceof Unknown) return Polynomial.create(new Monomial(undefined, a, undefined), new Monomial(undefined, undefined, [b]));
            if (b instanceof Array) return Polynomial.create(new Monomial(undefined, a, undefined), new Monomial(undefined, undefined, b));
            //a无理数，b单项式
            if (b instanceof Monomial)
                //若b中无理数等于a且不含未知数，将有理数部分+1
                if (a && a.equals(b.irrational) && !b.hasUnkown()) return new Monomial(<Rational>b.rational.add(Rational.One), a, undefined);
                //否则创建多项式
                else return Polynomial.create(new Monomial(undefined, a, undefined), b);
            //a无理数，b多项式
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项无理数等于a且不含未知数，将有理数部分+1
                    if (b.monomials[i].irrational.equals(a) && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = new Monomial(<Rational>Rational.One.add(b.monomials[i].rational), a);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = new Monomial(undefined, a, undefined);
                return b;
            }
        }
        if (a instanceof Unknown) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof Rational || b instanceof Irrational) return RealComputable.addReal(b, a);
            //a，b均为未知数，如果符号和指数相同，返回2a，否则创建多项式
            if (b instanceof Unknown)
                if (a.symbol == b.symbol && a.exponent == b.exponent) return new Monomial(new Rational(2, 1), undefined, [a]);
                else return Polynomial.create(new Monomial(undefined, undefined, [a]), new Monomial(undefined, undefined, [b]));
            if (b instanceof Array)
                if (b.length == 1 && a.equals(b[0])) return new Monomial(new Rational(2, 1), undefined, b);
                else return Polynomial.create(new Monomial(undefined, undefined, [a]), new Monomial(undefined, undefined, b));
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof Monomial)
                if (!b.hasIrrational && b.hasUnkown() && b.unknowns.length == 1 && b.unknowns[0].equals(a)) return new Monomial(<Rational>Rational.One.add(b.rational), undefined, [a]);
                else return Polynomial.create(new Monomial(undefined, undefined, [a]), b);
            //a未知数，b多项式
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项不含无理数且未知数符号和指数等于a，将有理数部分+1
                    if (!b.monomials[i].hasIrrational() && b.monomials[i].hasUnkown() && b.monomials[i].unknowns.length == 1 && b.monomials[i].equals(a)) {
                        b.monomials[i] = new Monomial(<Rational>Rational.One.add(b.monomials[i].rational), undefined, [a]);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = new Monomial(undefined, undefined, [a]);
                return b;
            }
        }
        if (a instanceof Monomial) {
            //a单项式，b为有理数或无理数或未知数，复用方法
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown) return RealComputable.addReal(b, a);
            if (b instanceof Array) {
                if (unknownEquals(a.unknowns, b)) return new Monomial(<Rational>RealComputable.addReal(a.rational, Rational.One), a.irrational, b);
                else return Polynomial.create(a, new Monomial(undefined, undefined, b));
            }
            //a，b均为单项式
            if (b instanceof Monomial) {
                //a，b无理数部分相同或不含无理数
                if ((a.hasIrrational() && b.hasIrrational() && a.irrational.equals(b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()))
                    //若a，b均含未知数且完全相同，或a，b均不含未知数，则将有理数部分相加
                    if (unknownEquals(a.unknowns, b.unknowns)) return new Monomial(<Rational>RealComputable.addReal(a.rational, b.rational), a.irrational, a.unknowns);
                //否则连接a，b创建多项式
                return Polynomial.create(a, b);
            }
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
                    if (((a.hasIrrational() && b.monomials[i].hasIrrational() && a.irrational.equals(b.monomials[i].irrational)) || (!a.hasIrrational() && !b.monomials[i].hasIrrational())) && (unknownEquals(a.unknowns, b.monomials[i].unknowns))) {
                        b.monomials[i] = new Monomial(<Rational>a.rational.add(b.monomials[i].rational), a.irrational, a.unknowns);
                    }
                //否则在多项式中添加一项
                b.monomials[i] = a;
                return b;
            }
        }
        if (a instanceof Array) {
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown || b instanceof Monomial) return RealComputable.addReal(b, a);
            if (b instanceof Array) if (unknownEquals(a, b)) return new Monomial(new Rational(2, 1), undefined, a);
            else return Polynomial.create(new Monomial(undefined, undefined, a), new Monomial(undefined, undefined, b));
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++) {
                    if (unknownEquals(a, b.monomials[i].unknowns))
                        b.monomials[i] = new Monomial(<Rational>RealComputable.addReal(Rational.One, b.monomials[i].rational), b.monomials[i].irrational, a);
                    return b;
                }
                b.monomials[i] = new Monomial(undefined, undefined, a);
                return b;
            }
        }
        if (a instanceof Polynomial)
            //a为多项式，b为，复用方法
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown || b instanceof Monomial || b instanceof Array)
                return RealComputable.addReal(b, a);
            else if (b instanceof Polynomial) {
                //***需要实现
            }
        throw new Error("未定义的运算:add(" + a + "," + b + ")");
    }
    //进度: 正在实现mulReal(a,b)，缺少较多类型的运算实现(Ctrl+F搜索"需要实现")
    static mulReal(a: RealComputable, b: RealComputable): RealComputable {
        if (b == undefined) return a;
        if (a instanceof Rational) {
            //a=0，不运算
            if (a.equals(Rational.Zero)) return Rational.Zero;
            if (a.equals(Rational.One)) return b;
            //a，b均为有理数，直接相乘
            if (b instanceof Rational) return new Rational(a.self * b.self, a.divisor * b.divisor);
            //a有理数，b无理数，创建单项式
            if (b instanceof Irrational) return new Monomial(a, b, undefined);
            //a有理数，b未知数，创建单项式
            if (b instanceof Unknown) return new Monomial(a, undefined, [b]);
            if (b instanceof Array) return new Monomial(a, undefined, b);
            //a有理数，b单项式
            if (b instanceof Monomial) return new Monomial(<Rational>a.mul(b.rational), b.irrational, b.unknowns);
            //a有理数，b多项式，每项乘以a
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUnkown())
                        b.monomials[i] = <Monomial>a.mul(b.monomials[i]);
                return b;
            }
        }
        if (a instanceof Irrational) {
            //a无理数，b有理数，复用方法
            if (b instanceof Rational) return b.mul(a);
            //a，b均为无理数，若均为常量则指数相加，若均为平方根则根号下相乘
            if (b instanceof Irrational)
                if (a instanceof SpecialConst && a.equals(b)) return new SpecialConst(a.type, a.exponent + (<SpecialConst>b).exponent);
                else if (a instanceof SquareRoot && b instanceof SquareRoot) return SquareRoot.create(a.self * b.self);
            //a无理数，b未知数，创建单项式
            if (b instanceof Unknown) return new Monomial(undefined, a, [b]);
            if (b instanceof Array) return new Monomial(undefined, a, b);
            //a无理数，b单项式
            if (b instanceof Monomial)
                if (b.irrational == undefined) return new Monomial(b.rational, a, b.unknowns);
                else return new Monomial(b.rational, undefined, b.unknowns).mul(a.mul(b.irrational));
            //a无理数，b多项式
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++) {
                    var re: RealComputable | Unknown[] = b.monomials[i].mul(a);
                    if (re instanceof Rational) b.monomials[i] = new Monomial(re, undefined, undefined);
                    else if (re instanceof Irrational) b.monomials[i] = new Monomial(undefined, re, undefined);
                    else if (re instanceof Monomial) b.monomials[i] = re;
                    else if (re instanceof Unknown) b.monomials[i] = new Monomial(undefined, undefined, [re]);
                    else if (re instanceof Array) b.monomials[i] = new Monomial(undefined, undefined, re);
                    else throw new Error("返回的运算值无效: " + re);
                }
                return b;
            }
        }
        if (a instanceof Unknown) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof Rational || b instanceof Irrational) return RealComputable.mulReal(b, a);
            //a，b均为未知数
            if (b instanceof Unknown)
                if (a.symbol == b.symbol) return new Unknown(a.symbol, a.exponent + b.exponent);
                else return [a, b];
            if (b instanceof Array) {
                //***需要实现
            }
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof Monomial)
                if (b.hasUnkown())
                    if (b.unknowns.length == 1 && b.unknowns[0].equals(a)) return new Monomial(b.rational, b.irrational, [<Unknown>a.mul(b.unknowns[0])]);
                    else return new Monomial(b.rational, b.irrational, unknownAdd(b.unknowns, a))
                else return new Monomial(b.rational, b.irrational, [a]);
            //a未知数，b多项式
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++) {
                    var re: RealComputable | Unknown[] = b.monomials[i].mul(a);
                    if (re instanceof Rational) b.monomials[i] = new Monomial(re, undefined, undefined);
                    else if (re instanceof Irrational) b.monomials[i] = new Monomial(undefined, re, undefined);
                    else if (re instanceof Monomial) b.monomials[i] = re;
                    else if (re instanceof Unknown) b.monomials[i] = new Monomial(undefined, undefined, [re]);
                    else if (re instanceof Array) b.monomials[i] = new Monomial(undefined, undefined, re);
                    else throw new Error("返回的运算值无效: " + re);
                }
                return b;
            }
        }
        // ***需要实现
        /*
        if (a instanceof Monomial) {
            //a单项式，b为有理数或无理数或未知数，复用方法
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown) return RealComputable.addReal(b, a);
            //a，b均为单项式
            if (b instanceof Monomial) {
                var r: Rational = <Rational>a.rational.mul(b.rational);
                var ir: RealComputable | Unknown[] = undefined;
                if (a.hasIrrational()) {
                    if (b.hasIrrational()) ir = a.irrational.mul(b.irrational);
                    else ir = a.irrational;
                } else ir = b.irrational;
                var u: RealComputable | Unknown[] = undefined;
                if (a.hasUnkown()) {
                    if (b.hasUnkown()) u = RealComputable.mulReal(a.unknowns, b.unknowns);
                    else u = a.unknowns;
                } else u = b.unknowns;
                return RealComputable.mulReal(RealComputable.mulReal(r, ir), u);
            }
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
                    if (((a.hasIrrational() && b.monomials[i].hasIrrational() && a.irrational.equals(b.monomials[i].irrational)) || (!a.hasIrrational() && !b.monomials[i].hasIrrational())) && (unknownEquals(a.unknowns, b.monomials[i].unknowns))) {
                        b.monomials[i] = new Monomial(<Rational>a.rational.add(b.monomials[i].rational), a.irrational, a.unknowns);
                    }
                //否则在多项式中添加一项
                b.monomials[i] = a;
                return b;
            }
        }*/
        if (a instanceof Array) {
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown) return RealComputable.mulReal(b, a);
            if (a instanceof Array) {
                // ***需要实现
            }
            if (a instanceof Polynomial) {
                // ***需要实现
            }
        }
        //a为多项式，复用方法
        if (a instanceof Polynomial)
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown || b instanceof Array || b instanceof Monomial) return RealComputable.mulReal(b, a);
        if (b instanceof Polynomial) {
            //***需要实现
        }
        throw new Error("未定义的运算:mul(" + a + "," + b + ")");
    }
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
        if (a instanceof IrrationalItem)
            if (b instanceof IrrationalItem)
                return this.irrationalItemEquals(a, b);
        if (a instanceof Unknown)
            if (b instanceof Unknown)
                return a.symbol == b.symbol && a.exponent == b.exponent;
            else return false;
        if (a instanceof UnknownItem)
            if (b instanceof UnknownItem)
                return this.unknownItemEquals(a, b);
        if (a instanceof ConstItem)
            if (b instanceof ConstItem)
                return this.constItemEquals(a, b);
        if (a instanceof Monomial)
            if (b instanceof Monomial)
                return a.const.equals(b.const) && a.unknowns.equals(b.unknowns);
            else return false;
        if (a instanceof Polynomial)
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < a.length(); i++)if (!a.monomials[i].equals(b.monomials[i])) return false;
                return true;
            }
        return false;
    }
    static irrationalItemEquals(a: IrrationalItem, b: IrrationalItem): boolean { return ((a.hasSquareRoot() && b.hasSquareRoot()) || (!a.hasSquareRoot() && !b.hasSquareRoot())) && this.specialConstEquals(a.consts, b.consts); }
    static specialConstEquals(a: SpecialConst[], b: SpecialConst[]): boolean {
        if (!a && !b) return true;
        if (a && b && a.length == b.length) {
            for (var i: number = 0; i < a.length; i++)
                if (!a[i].equals(b[i])) return false;
            return true;
        }
        return false;
    }
    static unknownItemEquals(a: UnknownItem, b: UnknownItem): boolean {
        if (a.length() == b.length()) {
            for (var i: number = 0; i < a.unknowns.length; i++)
                if (!a.unknowns[i].equals(b.unknowns[i])) return false;
            return true;
        }
        return false;
    }
    static constItemEquals(a: ConstItem, b: ConstItem): boolean { return a.rational.equals(b.rational) && a.irrational.equals(b.irrational); }
    abstract opp(): RealComputable;
    abstract rec(): RealComputable;
    add(n: RealComputable): RealComputable { return RealComputable.addReal(this, n); }
    min(n: RealComputable): RealComputable { return this.add(n.opp()); }
    mul(n: RealComputable): RealComputable { { return RealComputable.mulReal(this, n); } }
    div(n: RealComputable): RealComputable { return this.mul(n.rec()); }
    equals(n: RealComputable): boolean { return RealComputable.equals(this, n); }
}
class Unknown extends RealComputable {
    public readonly symbol: string;
    public readonly exponent: number;
    constructor(s: string, e: number, v: boolean = false) {
        super();
        this.symbol = s;
        if (v) this.exponent = t;
        else {
            if (!s || s.length != 1) throw new Error("未知数的命名无效");
            var t: number = toInt(e);
            if (t == 0) throw new Error("将不会对未知数进行零次幂运算。请尝试改用\"1\"")
        }
    }
    Squ(): Unknown { return new Unknown(this.symbol, this.exponent * this.exponent, true); }
    opp(): Monomial { return Monomial.createComplete(Rational.MinusOne, undefined, new UnknownItem([this])); }
    rec(): Unknown { return new Unknown(this.symbol, -this.exponent, true); }
}
function toInt(o: number): number {
    var i = o.toString().indexOf('.');
    if (i >= 0) throw new Error("暂不支持此位置为小数");
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
        if (!v) {
            if (d == 0) throw new Error("分母不能为0");
            if (s == 0) d = 1;
            else {
                if (d < 0) {
                    d = -d;
                    s = -s;
                }
                var gcd = greatestCommonDivisor(s, d);
                s /= gcd;
                d /= gcd;
            }
        }
        this.self = s;
        this.divisor = d;
    }
    Squ(): Rational { return new Rational(this.self * this.self, this.divisor); }
    Abs(): Rational { return new Rational(Math.abs(this.self), this.divisor); }
    opp(): Rational { return new Rational(-this.self, this.divisor); }
    rec(): Rational { return new Rational(this.divisor, this.self); }
}
abstract class Irrational extends RealComputable {
    public abstract irrationalEquals(n: Irrational): boolean;
    opp(): ConstItem { return new ConstItem(Rational.MinusOne, new IrrationalItem([this])) }
    abstract rec(): Rational | Irrational | ConstItem;
}
class SpecialConst extends Irrational {
    public readonly exponent: number;
    public irrationalEquals(n: Irrational): boolean { return n instanceof SpecialConst && n.exponent == this.exponent && n.type == this.type; }
    rec(): SpecialConst { return new SpecialConst(this.type, -this.exponent, true); }
    public readonly type: ConstType;
    constructor(t: ConstType = ConstType.Pi, e: number = 1, v: boolean = false) {
        super();
        if (v) this.exponent = e; else {
            if (e == 0) throw new Error("将不会对特殊常量进行零次幂运算。请尝试改用\"1\"");
            var ei: number = toInt(e);
            this.exponent = ei;
        }
        this.type = t;
    }
}
enum ConstType { Pi }
const MaxSquareBase: number = 50;
function generateSquareNumber() {
    SquareNumber = [];
    for (var i: number = 0; i < MaxSquareBase - 1; i++)
        SquareNumber[i] = (i + 2) * (i + 2);

}
var SquareNumber: number[] = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 676, 729, 784, 841, 900, 961, 1024, 1089, 1156, 1225, 1296, 1369, 1444, 1521, 1600, 1681, 1764, 1849, 1936, 2025, 2116, 2209, 2304, 2401, 2500];
if (!SquareNumber) generateSquareNumber();
//function CreateSquareRoot(s: number): Monomial | SquareRoot | Rational { return SquareRoot.Create(s); }
class SquareRoot extends Irrational {
    public irrationalEquals(n: Irrational): boolean { return n instanceof SquareRoot && n.self == this.self; }
    rec(): ConstItem { return new ConstItem(new Rational(1, this.self), new IrrationalItem([this])); }
    public readonly self: number;
    private constructor(s: number) {
        super();
        this.self = s;
    }
    public static unsafeCreate(s: number): SquareRoot { return new SquareRoot(s); }
    public static create(s: number): SquareRoot | Rational | ConstItem {
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
        return new ConstItem(new Rational(r, 1), new IrrationalItem([new SquareRoot(s)]));
    }
}
class ConstItem extends RealComputable {
    public hasRational(): boolean { return !this.rational.equals(Rational.One); }
    public hasIrrational(): boolean { return this.irrational != undefined; }
    opp(): ConstItem { return new ConstItem(this.rational.opp(), this.irrational); }
    rec(): ConstItem { return <ConstItem>RealComputable.mulReal(this.rational.rec(), this.irrational.rec()); }
    public readonly rational: Rational;
    public readonly irrational: IrrationalItem;
    constructor(r: Rational = Rational.One, i?: IrrationalItem) {
        super();
        this.rational = r;
        if (i) this.irrational = i;
    }
}
class IrrationalItem extends Irrational {
    public irrationalEquals(n: Irrational): boolean {
        if (n instanceof IrrationalItem)
            return ((this.hasSquareRoot() && n.hasSquareRoot()) || (!this.hasSquareRoot() && !n.hasSquareRoot())) && RealComputable.specialConstEquals(this.consts, n.consts);
    }
    public hasSquareRoot(): boolean { return this.squareRoot != undefined; }
    public hasConsts(): boolean { return this.consts.length > 0; }
    //public constLength():number{return consts}
    public readonly consts: SpecialConst[];
    public readonly squareRoot: SquareRoot;
    constructor(i: Irrational[]) {
        super();
        this.consts = [];
        var s: number = 1;
        for (var a: number = 0; a < i.length; a++)
            if (i[a] instanceof SpecialConst) this.consts[this.consts.length] = copyObject(<SpecialConst>i[a]);
            else if (i[a] instanceof SquareRoot) s *= (<SquareRoot>i[a]).self;
            else throw new Error("此无理数尚未定义: " + i[a]);
        if (s == 1 && this.consts.length <= 0) throw new Error("无法构造无内容的无理数项");
        if (s > 1) this.squareRoot = SquareRoot.unsafeCreate(s);
    }
    opp(): ConstItem { return new ConstItem(Rational.MinusOne, this); }
    rec(): Irrational | IrrationalItem | ConstItem {
        var ir: Irrational[] = new Irrational[this.consts.length];
        for (var i: number = 0; i < ir.length; i++)ir[i] = this.consts[i].rec();
        if (this.hasSquareRoot()) {
            ir[ir.length] = this.squareRoot;
            return new ConstItem(new Rational(1, this.squareRoot.self), new IrrationalItem(ir));
        }
        if (ir.length == 1) return ir[0];
        return new IrrationalItem(this.consts);
    }
}
class UnknownItem extends RealComputable {
    public readonly unknowns: Unknown[];
    length(): number { return this.unknowns.length; }
    constructor(u: Unknown[]) {
        super();
        if (!u || u.length <= 0) throw new Error("无法构造无内容的未知数项");
        this.unknowns = u;
    }
    opp(): Monomial { return Monomial.createComplete(Rational.MinusOne, undefined, this); }
    rec(): UnknownItem {
        var tu: Unknown[] = copyObject(this.unknowns);
        for (var i: number = 0; i < tu.length; i++)
            tu[i] = new Unknown(tu[i].symbol, -tu[i].exponent);
        return new UnknownItem(tu);
    }
}
class Monomial extends RealComputable {
    public hasRational(): boolean { return !this.const || !Rational.One.equals(this.const.rational); }
    public hasIrrational(): boolean { return this.const && this.const.hasIrrational(); }
    public hasUnkown(): boolean { return this.unknowns != undefined; }
    public readonly const: ConstItem;
    public readonly unknowns: UnknownItem;
    private constructor(c: ConstItem, u: UnknownItem) {
        super();
        this.const = c;
        if (u && u.length() > 0)
            this.unknowns = u;
    }
    public static createComplete(r: Rational = Rational.One, i?: Irrational[], u?: UnknownItem): Monomial { return new Monomial(new ConstItem(r, new IrrationalItem(i)), u); }
    public static create(i: Rational | Irrational | IrrationalItem | ConstItem | Unknown | UnknownItem) {
        if (i instanceof Rational) return new Monomial(new ConstItem(i), undefined);
        if (i instanceof Irrational) return new Monomial(new ConstItem(undefined, new IrrationalItem([i])), undefined);
        if (i instanceof IrrationalItem) return new Monomial(new ConstItem(undefined, i), undefined);
        if (i instanceof ConstItem) return new Monomial(i, undefined);
        if (i instanceof Unknown) return new Monomial(undefined, new UnknownItem([i]));
        if (i instanceof UnknownItem) return new Monomial(undefined, i);
        throw new Error("此对象无法用于构造单项式: " + i);
    }
    opp(): Monomial { return new Monomial(this.const.opp(), this.unknowns); }
    rec(): Monomial {
        var nu: UnknownItem = copyObject(this.unknowns);
        if (nu)
            for (var i: number; i < nu.length(); i++)
                nu.unknowns[i] = nu.unknowns[i].rec();
        return new Monomial(this.const.rec(), this.unknowns.rec());
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
    static create(...m: Monomial[]): Monomial | Polynomial {
        if (!m || m.length <= 0) throw new Error("无法构造无内容的多项式");
        if (m.length == 1) return m[0];
        return new Polynomial(m);
    }
    opp(): Polynomial {
        var _m = <Monomial[]>copyObject(this.monomials);
        for (var i: number; i < _m.length; i++)
            _m[i] = _m[i].opp();
        return new Polynomial(_m);
    }
    rec(): Monomial {
        if (this.monomials && this.monomials.length == 1) return this.monomials[0].rec();
        throw new Error("暂不支持取多项式倒数");
    }
}
function greatestCommonDivisor(a: number, b: number) {
    var c = a % b;
    if (c == 0) {
        return b;
    }
    return arguments.callee(b, c);
}