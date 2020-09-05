/*
Copyright © 2020 All rights reserved.
Author: LonelyDagger, Passthem, Tealing
DONOT DISTRIBUTE! VIOLATORS WILL BE DEALT WITH ACCORDING TO LAW.
 */
function copyObject<T extends object>(origin: T): T { return Object.create(origin).__proto__; }
abstract class RealComputable {
    static addReal(a: RealComputable, b: RealComputable): RealComputable {
        if (b == undefined) return a;
        if (a instanceof Rational) {
            //a，b均为有理数，分数通分加减法(Rational构造函数负责化简)
            if (b instanceof Rational) return new Rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
            //a有理数，b无理数/未知数，创建多项式
            if (b instanceof Irrational || b instanceof Uncertain || b instanceof UncertainItem) return Polynomial.create(Monomial.create(a), Monomial.create(b));
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
                if (a.equals(b)) return new ConstItem(new Rational(2, 1, true), IrrationalItem.create(a));
                else return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a无理数，b未知数，创建多项式
            if (b instanceof Uncertain) return Polynomial.create(new Monomial(undefined, a, undefined), new Monomial(undefined, undefined, [b]));
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
        if (a instanceof Uncertain) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof Rational || b instanceof Irrational) return RealComputable.addReal(b, a);
            //a，b均为未知数，如果符号和指数相同，返回2a，否则创建多项式
            if (b instanceof Uncertain)
                if (a.symbol == b.symbol && a.exponent == b.exponent) return new Monomial(new Rational(2, 1), undefined, [a]);
                else return Polynomial.create(new Monomial(undefined, undefined, [a]), new Monomial(undefined, undefined, [b]));
            if (b instanceof Array)
                if (b.length == 1 && a.equals(b[0])) return new Monomial(new Rational(2, 1), undefined, b);
                else return Polynomial.create(new Monomial(undefined, undefined, [a]), new Monomial(undefined, undefined, b));
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof Monomial)
                if (!b.hasIrrational && b.hasUnkown() && b.uncertains.length == 1 && b.uncertains[0].equals(a)) return new Monomial(<Rational>Rational.One.add(b.rational), undefined, [a]);
                else return Polynomial.create(new Monomial(undefined, undefined, [a]), b);
            //a未知数，b多项式
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项不含无理数且未知数符号和指数等于a，将有理数部分+1
                    if (!b.monomials[i].hasIrrational() && b.monomials[i].hasUnkown() && b.monomials[i].uncertains.length == 1 && b.monomials[i].equals(a)) {
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
            if (b instanceof Rational || b instanceof Irrational || b instanceof Uncertain) return RealComputable.addReal(b, a);
            if (b instanceof Array) {
                if (uncertainEquals(a.uncertains, b)) return new Monomial(<Rational>RealComputable.addReal(a.rational, Rational.One), a.irrational, b);
                else return Polynomial.create(a, new Monomial(undefined, undefined, b));
            }
            //a，b均为单项式
            if (b instanceof Monomial) {
                //a，b无理数部分相同或不含无理数
                if ((a.hasIrrational() && b.hasIrrational() && a.irrational.equals(b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()))
                    //若a，b均含未知数且完全相同，或a，b均不含未知数，则将有理数部分相加
                    if (uncertainEquals(a.uncertains, b.uncertains)) return new Monomial(<Rational>RealComputable.addReal(a.rational, b.rational), a.irrational, a.uncertains);
                //否则连接a，b创建多项式
                return Polynomial.create(a, b);
            }
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
                    if (((a.hasIrrational() && b.monomials[i].hasIrrational() && a.irrational.equals(b.monomials[i].irrational)) || (!a.hasIrrational() && !b.monomials[i].hasIrrational())) && (uncertainEquals(a.uncertains, b.monomials[i].uncertains))) {
                        b.monomials[i] = new Monomial(<Rational>a.rational.add(b.monomials[i].rational), a.irrational, a.uncertains);
                    }

                //否则在多项式中添加一项
                b.monomials[i] = a;
                return b;
            }
        }
        if (a instanceof Array) {
            if (b instanceof Rational || b instanceof Irrational || b instanceof Uncertain || b instanceof Monomial) return RealComputable.addReal(b, a);
            if (b instanceof Array) if (uncertainEquals(a, b)) return new Monomial(new Rational(2, 1), undefined, a);
            else return Polynomial.create(new Monomial(undefined, undefined, a), new Monomial(undefined, undefined, b));
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++) {
                    if (uncertainEquals(a, b.monomials[i].uncertains))
                        b.monomials[i] = new Monomial(<Rational>RealComputable.addReal(Rational.One, b.monomials[i].rational), b.monomials[i].irrational, a);
                    return b;
                }
                b.monomials[i] = new Monomial(undefined, undefined, a);
                return b;
            }
        }
        if (a instanceof Polynomial)
            //a为多项式，b为，复用方法
            if (b instanceof Rational || b instanceof Irrational || b instanceof Uncertain || b instanceof Monomial || b instanceof Array)
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
            if (b instanceof Uncertain) return new Monomial(a, undefined, [b]);
            if (b instanceof Array) return new Monomial(a, undefined, b);
            //a有理数，b单项式
            if (b instanceof Monomial) return new Monomial(<Rational>a.mul(b.rational), b.irrational, b.uncertains);
            //a有理数，b多项式，每项乘以a
            if (b instanceof Polynomial) {
                for (let i: number = 0; i < b.length(); i++)
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
            if (b instanceof Uncertain) return new Monomial(undefined, a, [b]);
            if (b instanceof Array) return new Monomial(undefined, a, b);
            //a无理数，b单项式
            if (b instanceof Monomial)
                if (b.irrational == undefined) return new Monomial(b.rational, a, b.uncertains);
                else return new Monomial(b.rational, undefined, b.uncertains).mul(a.mul(b.irrational));
            //a无理数，b多项式
            if (b instanceof Polynomial) {
                for (let i: number = 0; i < b.length(); i++) {
                    var re: RealComputable | Uncertain[] = b.monomials[i].mul(a);
                    if (re instanceof Rational) b.monomials[i] = new Monomial(re, undefined, undefined);
                    else if (re instanceof Irrational) b.monomials[i] = new Monomial(undefined, re, undefined);
                    else if (re instanceof Monomial) b.monomials[i] = re;
                    else if (re instanceof Uncertain) b.monomials[i] = new Monomial(undefined, undefined, [re]);
                    else if (re instanceof Array) b.monomials[i] = new Monomial(undefined, undefined, re);
                    else throw new Error("返回的运算值无效: " + re);
                }
                return b;
            }
        }
        if (a instanceof Uncertain) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof Rational || b instanceof Irrational) return RealComputable.mulReal(b, a);
            //a，b均为未知数
            if (b instanceof Uncertain)
                if (a.symbol == b.symbol) return new Uncertain(a.symbol, a.exponent + b.exponent);
                else return [a, b];
            if (b instanceof Array) {
                //***需要实现
            }
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof Monomial)
                if (b.hasUnkown())
                    if (b.uncertains.length == 1 && b.uncertains[0].equals(a)) return new Monomial(b.rational, b.irrational, [<Uncertain>a.mul(b.uncertains[0])]);
                    else return new Monomial(b.rational, b.irrational, uncertainAdd(b.uncertains, a))
                else return new Monomial(b.rational, b.irrational, [a]);
            //a未知数，b多项式
            if (b instanceof Polynomial) {
                for (let i: number = 0; i < b.length(); i++) {
                    var re: RealComputable | Uncertain[] = b.monomials[i].mul(a);
                    if (re instanceof Rational) b.monomials[i] = new Monomial(re, undefined, undefined);
                    else if (re instanceof Irrational) b.monomials[i] = new Monomial(undefined, re, undefined);
                    else if (re instanceof Monomial) b.monomials[i] = re;
                    else if (re instanceof Uncertain) b.monomials[i] = new Monomial(undefined, undefined, [re]);
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
            if (b instanceof Rational || b instanceof Irrational || b instanceof Unknown) return realComputable.addReal(b, a);
            //a，b均为单项式
            if (b instanceof Monomial) {
                var r: Rational = <Rational>a.rational.mul(b.rational);
                var ir: realComputable | Unknown[] = undefined;
                if (a.hasIrrational()) {
                    if (b.hasIrrational()) ir = a.irrational.mul(b.irrational);
                    else ir = a.irrational;
                } else ir = b.irrational;
                var u: realComputable | Unknown[] = undefined;
                if (a.hasUnkown()) {
                    if (b.hasUnkown()) u = realComputable.mulReal(a.uncertains, b.uncertains);
                    else u = a.uncertains;
                } else u = b.uncertains;
                return realComputable.mulReal(realComputable.mulReal(r, ir), u);
            }
            if (b instanceof Polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
                    if (((a.hasIrrational() && b.monomials[i].hasIrrational() && a.irrational.equals(b.monomials[i].irrational)) || (!a.hasIrrational() && !b.monomials[i].hasIrrational())) && (uncertainEquals(a.uncertains, b.monomials[i].uncertains))) {
                        b.monomials[i] = new Monomial(<Rational>a.rational.add(b.monomials[i].rational), a.irrational, a.uncertains);
                    }
                //否则在多项式中添加一项
                b.monomials[i] = a;
                return b;
            }
        }*/
        if (a instanceof Array) {
            if (b instanceof Rational || b instanceof Irrational || b instanceof Uncertain) return RealComputable.mulReal(b, a);
            if (a instanceof Array) {
                // ***需要实现
            }
            if (a instanceof Polynomial) {
                // ***需要实现
            }
        }
        //a为多项式，复用方法
        if (a instanceof Polynomial)
            if (b instanceof Rational || b instanceof Irrational || b instanceof Uncertain || b instanceof Array || b instanceof Monomial) return RealComputable.mulReal(b, a);
        if (b instanceof Polynomial) {
            //***需要实现
        }
        throw new Error("未定义的运算:mul(" + a + "," + b + ")");
    }
    //进度: 已完成equals(a,b)。
    static equals(a: RealComputable, b: RealComputable): boolean {
        if (a == b) return true;
        if (a instanceof Rational) {
            if (b instanceof Rational)
                return a.self == b.self && a.divisor == b.divisor;
            if (b instanceof ConstItem)
                return !b.hasIrrational() && RealComputable.equals(a, b.rational);
            if (b instanceof Monomial)
                return !b.hasIrrational() && !b.hasUnkown() && RealComputable.equals(a, b.const.rational);
        }
        if (a instanceof Irrational) {
            if (b instanceof Irrational)
                return Irrational.irrationalEquals(a, b);
            if (b instanceof ConstItem)
                return !b.hasRational() && RealComputable.equals(a, b.irrational);
            if (b instanceof Monomial)
                return !b.hasRational() && !b.hasUnkown() && RealComputable.equals(a, b.const.irrational);
        }
        if (a instanceof ConstItem) {
            if (b instanceof Rational)
                return !a.hasIrrational() && RealComputable.equals(a.rational, b);
            if (b instanceof Irrational)
                return !a.hasRational() && RealComputable.equals(a.irrational, b);
            if (b instanceof ConstItem)
                return ((a.hasRational() && b.hasRational() && RealComputable.equals(a.rational, b.rational)) || (!a.hasRational() && !b.hasRational())) && ((a.hasIrrational() && b.hasIrrational() && RealComputable.equals(a.irrational, b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()));
            if (b instanceof Monomial)
                return !b.hasUnkown() && RealComputable.equals(a, b.const);
        }
        if (a instanceof Uncertain) {
            if (b instanceof Uncertain)
                return a.symbol == b.symbol && a.exponent == b.exponent;
            if (b instanceof UncertainItem)
                return b.uncertains.length == 1 && RealComputable.equals(a, b.uncertains[0]);
            if (b instanceof Monomial)
                return !b.hasRational() && !b.hasIrrational() && RealComputable.equals(a, b.uncertains);
        }
        if (a instanceof UncertainItem) {
            if (b instanceof Uncertain)
                return a.uncertains.length == 1 && RealComputable.equals(a.uncertains[0], b);
            if (b instanceof UncertainItem)
                if (a.uncertains.length == b.uncertains.length) {
                    for (let i: number = 0; i < a.uncertains.length; i++)
                        if (!RealComputable.equals(a.uncertains[i], b.uncertains[i]))
                            return false;
                    return true;
                }
            if (b instanceof Monomial)
                return !b.hasRational() && !b.hasIrrational() && RealComputable.equals(a, b.uncertains);
        }
        if (a instanceof Monomial) {
            if (b instanceof Rational || b instanceof Irrational || b instanceof ConstItem || b instanceof Uncertain || b instanceof UncertainItem)
                return RealComputable.equals(b, a);
            if (b instanceof Monomial)
                return RealComputable.equals(a.const, b.const) && RealComputable.equals(a.uncertains, b.uncertains);
        }
        if (a instanceof Polynomial)
            if (b instanceof Polynomial) {
                if (a.monomials.length == b.monomials.length) {
                    for (let i: number = 0; i < a.length(); i++)if (!RealComputable.equals(a.monomials[i], b.monomials[i])) return false;
                    return true;
                }
            }
        return false;
    }
    abstract opp(): RealComputable;
    abstract rec(): RealComputable;
    add(n: RealComputable): RealComputable { return RealComputable.addReal(this, n); }
    min(n: RealComputable): RealComputable { return this.add(n.opp()); }
    mul(n: RealComputable): RealComputable { { return RealComputable.mulReal(this, n); } }
    div(n: RealComputable): RealComputable { return this.mul(n.rec()); }
    equals(n: RealComputable): boolean { return RealComputable.equals(this, n); }
}
class Uncertain extends RealComputable {
    public readonly symbol: string;
    public readonly exponent: number;
    constructor(s: string, e: number = 1, v: boolean = false) {
        super();
        this.symbol = s;
        if (v) this.exponent = e;
        else {
            if (!s || s.length != 1) throw new Error("未知数的命名无效: 长度不能为" + (s ? s.length : "0"));
            if (!(s >= "a" && s <= "z")) throw new Error("未知数的命名无效: 无效的字符: " + s);
            if (e == 0) throw new Error("将不会对未知数进行零次幂运算。请尝试改用\"1\"")
            checkInt(e);
        }
    }
    opp(): Monomial { return Monomial.createComplete(Rational.MinusOne, undefined, new UncertainItem([this])); }
    rec(): Uncertain { return new Uncertain(this.symbol, -this.exponent, true); }
}
function checkInt(o: number) {
    var i = o.toString().indexOf('.');
    if (i >= 0) throw new Error("无效的小数");
}
class Rational extends RealComputable {
    public static readonly One: Rational = new Rational(1, 1, true);
    public static readonly Zero: Rational = new Rational(0, 1, true);
    public static readonly MinusOne: Rational = new Rational(-1, 1, true);
    public readonly self: number;
    public readonly divisor: number;
    constructor(s: number, d: number, v: boolean = false) {
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
    opp(): Rational { return new Rational(-this.self, this.divisor); }
    rec(): Rational { return new Rational(this.divisor, this.self); }
}
abstract class Irrational extends RealComputable {
    public static irrationalEquals(a: Irrational, b: Irrational): boolean {
        if (a == b) return true;
        if (a instanceof SpecialConst) {
            if (b instanceof SpecialConst) return a.type == b.type && a.exponent == b.exponent;
            if (b instanceof SpecialConstItem) return b.consts.length == 1 && this.irrationalEquals(a, b.consts[0]);
            if (b instanceof IrrationalItem) return !b.hasSquareRoot() && b.consts && b.consts.length() == 1 && this.irrationalEquals(a, b.consts[0]);
        }
        if (a instanceof SpecialConstItem) {
            if (b instanceof SpecialConst) return this.irrationalEquals(b, a);
            if (b instanceof SpecialConstItem) {
                if (a.consts.length == b.consts.length) {
                    for (let i: number = 0; i < a.consts.length; i++)
                        if (!this.irrationalEquals(a.consts[i], b.consts[i])) return false;
                    return true;
                }
            }
            if (b instanceof IrrationalItem) return !b.hasSquareRoot() && this.irrationalEquals(a, b.consts);
        }
        if (a instanceof SquareRoot) {
            if (b instanceof SquareRoot) return a.self == b.self;
            if (b instanceof IrrationalItem) return !b.hasConsts() && b.squareRoot && a.self == b.squareRoot.self;
        }
        if (a instanceof IrrationalItem) {
            if (a.hasConsts()) {
                if (a.hasSquareRoot()) return b instanceof IrrationalItem && b.hasConsts() && b.hasSquareRoot() && this.irrationalEquals(a.consts, b.consts) && this.irrationalEquals(a.squareRoot, b.squareRoot);
                return this.irrationalEquals(a.consts, b);
            }
            return this.irrationalEquals(a.squareRoot, b);
        }
        return false;
    }
    opp(): ConstItem { return new ConstItem(Rational.MinusOne, IrrationalItem.create(this)) }
    abstract rec(): Rational | Irrational | ConstItem;
}
class SpecialConst extends Irrational {
    public readonly type: ConstType;
    public readonly exponent: number;
    constructor(t: ConstType, e: number = 1, v: boolean = false) {
        super();
        if (v) this.exponent = e; else {
            if (e == 0) throw new Error("将不会对特殊常量进行零次幂运算。请尝试改用\"1\"");
            checkInt(e);
            this.exponent = e;
        }
        this.type = t;
    }
    rec(): SpecialConst { return new SpecialConst(this.type, -this.exponent, true); }
}
enum ConstType { Pi }
const MaxSquareBase: number = 50;
function generateSquareNumber() {
    SquareNumber = [];
    for (let i: number = 0; i < MaxSquareBase - 1; i++)
        SquareNumber[i] = (i + 2) * (i + 2);

}
var SquareNumber: number[] = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 676, 729, 784, 841, 900, 961, 1024, 1089, 1156, 1225, 1296, 1369, 1444, 1521, 1600, 1681, 1764, 1849, 1936, 2025, 2116, 2209, 2304, 2401, 2500];
if (!SquareNumber) generateSquareNumber();
class SquareRoot extends Irrational {
    public readonly self: number;
    private constructor(s: number) {
        super();
        this.self = s;
    }
    public static unsafeCreate(s: number): SquareRoot { return new SquareRoot(s); }
    public static create(s: number): SquareRoot | Rational | ConstItem {
        if (s < 0) throw new Error("负数没有实数平方根");
        if (s == 0) return Rational.Zero;
        if (s == 1) return Rational.One;
        checkInt(s);
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
        return new ConstItem(new Rational(r, 1), IrrationalItem.create(new SquareRoot(s)));
    }
    rec(): ConstItem { return new ConstItem(new Rational(1, this.self), IrrationalItem.create(this)); }
}
class ConstItem extends RealComputable {
    public hasRational(): boolean { return !this.rational.equals(Rational.One); }
    public hasIrrational(): boolean { return this.irrational != undefined; }
    opp(): ConstItem { return new ConstItem(this.rational.opp(), this.irrational); }
    rec(): Rational | Irrational | ConstItem {
        var tr: Rational = this.hasRational() ? this.rational.rec() : Rational.One;
        if (this.hasIrrational())
            return <Irrational | ConstItem>RealComputable.mulReal(tr, this.irrational.rec());
        return tr;
    }
    public readonly rational: Rational;
    public readonly irrational: IrrationalItem;
    constructor(r: Rational = Rational.One, i?: IrrationalItem) {
        super();
        this.rational = r;
        this.irrational = i;
    }
}
class SpecialConstItem extends Irrational {
    public readonly consts: SpecialConst[];
    constructor(c: SpecialConst[]) {
        super();
        if (c && c.length > 0) this.consts = c;
        else throw new Error("无法构造无内容的特殊常数项");
    }
    public static create(...c: SpecialConst[]): SpecialConstItem { return new SpecialConstItem(c); }
    rec(): SpecialConstItem {
        var ts: SpecialConst[] = new SpecialConst[this.consts.length];
        for (let i: number = 0; i < ts.length; i++)
            ts[i] = new SpecialConst(this.consts[i].type, - this.consts[i].exponent);
        return new SpecialConstItem(ts);
    }
    public length(): number { return this.consts.length; }
}
class IrrationalItem extends Irrational {
    public hasSquareRoot(): boolean { return this.squareRoot != undefined; }
    public hasConsts(): boolean { return this.consts != undefined; }
    //public constLength():number{return consts}
    public readonly consts: SpecialConstItem;
    public readonly squareRoot: SquareRoot;
    private constructor(i: Irrational[]) {
        super();
        if (i.length <= 0) throw new Error("无法构造无内容的无理数项");
        var ts: SpecialConst[];
        for (var a: number = 0; a < i.length; a++)
            if (i[a] instanceof SpecialConst) ts[ts.length] = copyObject(<SpecialConst>i[a]);
            else if (i[a] instanceof SquareRoot) this.squareRoot = <SquareRoot>i[a];
            else throw new Error("此无理数尚未定义: " + i[a]);
        if (ts && ts.length > 0) this.consts = new SpecialConstItem(ts);
    }
    public static create(...i: Irrational[]): IrrationalItem { return this.createByArray(i); }
    public static createByArray(i: Irrational[]): IrrationalItem {
        if (i.length == 1 && i[0] instanceof IrrationalItem) return <IrrationalItem>i[0];
        return new IrrationalItem(i);
    }
    opp(): ConstItem { return new ConstItem(Rational.MinusOne, this); }
    rec(): Irrational | ConstItem {
        var re: any = Rational.One;
        if (this.hasConsts()) {
            for (let i: number = 0; i < this.consts.length(); i++)
                re = RealComputable.mulReal(re, this.consts.consts[i]);
        }
        if (this.hasSquareRoot()) re = RealComputable.mulReal(re, this.squareRoot);
        return re;
    }
    //public static create(...i: Irrational[]): IrrationalItem { return new IrrationalItem(i); }
}
class UncertainItem extends RealComputable {
    public readonly uncertains: Uncertain[];
    length(): number { return this.uncertains.length; }
    constructor(u: Uncertain[]) {
        super();
        if (!u || u.length <= 0) throw new Error("无法构造无内容的未知数项");
        this.uncertains = u;
    }
    opp(): Monomial { return Monomial.createComplete(Rational.MinusOne, undefined, this); }
    rec(): UncertainItem {
        var tu: Uncertain[] = copyObject(this.uncertains);
        for (let i: number = 0; i < tu.length; i++)
            tu[i] = new Uncertain(tu[i].symbol, -tu[i].exponent);
        return new UncertainItem(tu);
    }
}
class Monomial extends RealComputable {
    public hasRational(): boolean { return this.const.hasRational(); }
    public hasIrrational(): boolean { return this.const.hasIrrational(); }
    public hasUnkown(): boolean { return this.uncertains != undefined; }
    public readonly const: ConstItem;
    public readonly uncertains: UncertainItem;
    private constructor(c: ConstItem, u: UncertainItem) {
        super();
        this.const = c ? c : new ConstItem(Rational.One, undefined);
        if (u && u.length() > 0)
            this.uncertains = u;
    }
    public static createComplete(r: Rational = Rational.One, i?: Irrational[], u?: UncertainItem): Monomial { return new Monomial(new ConstItem(r, IrrationalItem.createByArray(i)), u); }
    public static create(i: Rational | Irrational | ConstItem | Uncertain | UncertainItem) {
        if (i instanceof Rational) return new Monomial(new ConstItem(i), undefined);
        if (i instanceof SpecialConst || i instanceof SquareRoot) return new Monomial(new ConstItem(undefined, IrrationalItem.create(i)), undefined);
        if (i instanceof SpecialConstItem) return new Monomial(new ConstItem(undefined, IrrationalItem.createByArray(i.consts)), undefined);
        if (i instanceof IrrationalItem) return new Monomial(new ConstItem(undefined, i), undefined);
        if (i instanceof ConstItem) return new Monomial(i, undefined);
        if (i instanceof Uncertain) return new Monomial(undefined, new UncertainItem([i]));
        if (i instanceof UncertainItem) return new Monomial(undefined, i);
        throw new Error("此对象无法用于构造单项式: " + i);
    }
    opp(): Monomial { return new Monomial(this.const.opp(), this.uncertains); }
    rec(): Monomial { return new Monomial(this.const.rec(), this.uncertains.rec()); }
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
        var tm = <Monomial[]>copyObject(this.monomials);
        for (let i: number; i < tm.length; i++)
            tm[i] = tm[i].opp();
        return new Polynomial(tm);
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