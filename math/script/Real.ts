/*
Copyright © 2020 ll rights reserved.
Author: LonelyDagger, Passthem, Tealing
Released on teable.top/math
DONOT DISTRIBUTE! VIOLATORS WILL BE DEALT WITH ACCORDING TO LAW.
 */
const advisedMaxNumber: number = 1e10;
// {I don't know how many} Errors left. Old version file: Real.old.ts(No errors but with less expansibility and implement)
function copyObject<T extends object>(origin: T): T { return Object.create(origin).__proto__; }
abstract class realComputable {
    static addReal(a: realComputable, b: realComputable): realComputable {
        if (b == undefined) return a;
        if (a instanceof rational) {
            //a，b均为有理数，分数通分加减法(Rational构造函数负责化简)
            if (b instanceof rational) return new rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
            //a有理数，b无理数/未知数，创建多项式
            if (b instanceof irrational || b instanceof uncertain || b instanceof uncertainItem) return polynomial.create(monomial.create(a), monomial.create(b));
            if (b instanceof constItem)
                if (b.hasIrrational()) return polynomial.create(monomial.create(a), monomial.create(b));
                else return realComputable.addReal(a, b.rational);
            //a有理数，b单项式
            if (b instanceof monomial)
                //若b不含无理数和未知数，将有理数部分相加
                if (!b.hasIrrational() && !b.hasUnkown()) return realComputable.addReal(a, b.const.rational);
                //否则创建多项式
                else return polynomial.create(monomial.create(a), b);
            //a有理数，b多项式
            if (b instanceof polynomial) {
                //遍历b中每一项
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项不含无理数和未知数，将有理数部分相加
                    if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = monomial.create(<rational>realComputable.addReal(a, b.monomials[i].const.rational));
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = monomial.create(a);
                return b;
            }
        }
        if (a instanceof irrational) {
            //a无理数，b有理数，复用方法
            if (b instanceof rational) return b.add(a);
            //a，b均为无理数，判断无理数是否相等，相等返回2a，否则创建多项式
            if (b instanceof irrational)
                if (a.equals(b)) return new constItem(new rational(2, 1, true), irrationalItem.create(a));
                else return polynomial.create(monomial.create(a), monomial.create(b));
            //a无理数，b未知数，创建多项式
            if (b instanceof uncertain) return polynomial.create(new monomial(undefined, a, undefined), new monomial(undefined, undefined, [b]));
            if (b instanceof Array) return polynomial.create(new monomial(undefined, a, undefined), new monomial(undefined, undefined, b));
            //a无理数，b单项式
            if (b instanceof monomial)
                //若b中无理数等于a且不含未知数，将有理数部分+1
                if (a && a.equals(b.irrational) && !b.hasUnkown()) return new monomial(<rational>b.rational.add(rational.One), a, undefined);
                //否则创建多项式
                else return polynomial.create(new monomial(undefined, a, undefined), b);
            //a无理数，b多项式
            if (b instanceof polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项无理数等于a且不含未知数，将有理数部分+1
                    if (b.monomials[i].irrational.equals(a) && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = new monomial(<rational>rational.One.add(b.monomials[i].rational), a);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = new monomial(undefined, a, undefined);
                return b;
            }
        }
        if (a instanceof uncertain) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof rational || b instanceof irrational) return realComputable.addReal(b, a);
            //a，b均为未知数，如果符号和指数相同，返回2a，否则创建多项式
            if (b instanceof uncertain)
                if (a.symbol == b.symbol && a.exponent == b.exponent) return new monomial(new rational(2, 1), undefined, [a]);
                else return polynomial.create(new monomial(undefined, undefined, [a]), new monomial(undefined, undefined, [b]));
            if (b instanceof Array)
                if (b.length == 1 && a.equals(b[0])) return new monomial(new rational(2, 1), undefined, b);
                else return polynomial.create(new monomial(undefined, undefined, [a]), new monomial(undefined, undefined, b));
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof monomial)
                if (!b.hasIrrational && b.hasUnkown() && b.uncertains.length == 1 && b.uncertains[0].equals(a)) return new monomial(<rational>rational.One.add(b.rational), undefined, [a]);
                else return polynomial.create(new monomial(undefined, undefined, [a]), b);
            //a未知数，b多项式
            if (b instanceof polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项不含无理数且未知数符号和指数等于a，将有理数部分+1
                    if (!b.monomials[i].hasIrrational() && b.monomials[i].hasUnkown() && b.monomials[i].uncertains.length == 1 && b.monomials[i].equals(a)) {
                        b.monomials[i] = new monomial(<rational>rational.One.add(b.monomials[i].rational), undefined, [a]);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = new monomial(undefined, undefined, [a]);
                return b;
            }
        }
        if (a instanceof monomial) {
            //a单项式，b为有理数或无理数或未知数，复用方法
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain) return realComputable.addReal(b, a);
            if (b instanceof Array) {
                if (uncertainEquals(a.uncertains, b)) return new monomial(<rational>realComputable.addReal(a.rational, rational.One), a.irrational, b);
                else return polynomial.create(a, new monomial(undefined, undefined, b));
            }
            //a，b均为单项式
            if (b instanceof monomial) {
                //a，b无理数部分相同或不含无理数
                if ((a.hasIrrational() && b.hasIrrational() && a.irrational.equals(b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()))
                    //若a，b均含未知数且完全相同，或a，b均不含未知数，则将有理数部分相加
                    if (uncertainEquals(a.uncertains, b.uncertains)) return new monomial(<rational>realComputable.addReal(a.rational, b.rational), a.irrational, a.uncertains);
                //否则连接a，b创建多项式
                return polynomial.create(a, b);
            }
            if (b instanceof polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
                    if (((a.hasIrrational() && b.monomials[i].hasIrrational() && a.irrational.equals(b.monomials[i].irrational)) || (!a.hasIrrational() && !b.monomials[i].hasIrrational())) && (uncertainEquals(a.uncertains, b.monomials[i].uncertains))) {
                        b.monomials[i] = new monomial(<rational>a.rational.add(b.monomials[i].rational), a.irrational, a.uncertains);
                    }
                //否则在多项式中添加一项
                b.monomials[i] = a;
                return b;
            }
        }
        if (a instanceof Array) {
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain || b instanceof monomial) return realComputable.addReal(b, a);
            if (b instanceof Array) if (uncertainEquals(a, b)) return new monomial(new rational(2, 1), undefined, a);
            else return polynomial.create(new monomial(undefined, undefined, a), new monomial(undefined, undefined, b));
            if (b instanceof polynomial) {
                for (var i: number = 0; i < b.length(); i++) {
                    if (uncertainEquals(a, b.monomials[i].uncertains))
                        b.monomials[i] = new monomial(<rational>realComputable.addReal(rational.One, b.monomials[i].rational), b.monomials[i].irrational, a);
                    return b;
                }
                b.monomials[i] = new monomial(undefined, undefined, a);
                return b;
            }
        }
        if (a instanceof polynomial)
            //a为多项式，b为，复用方法
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain || b instanceof monomial || b instanceof Array)
                return realComputable.addReal(b, a);
            else if (b instanceof polynomial) {
                //***需要实现
            }
        throw new Error("未定义的运算:add(" + a + "," + b + ")");
    }
    //进度: 正在实现mulReal(a,b)，缺少较多类型的运算实现(Ctrl+F搜索"需要实现")
    static mulReal(a: realComputable, b: realComputable): realComputable {
        if (b == undefined) return a;
        if (a instanceof rational) {
            //a=0，不运算
            if (a.equals(rational.Zero)) return rational.Zero;
            if (a.equals(rational.One)) return b;
            //a，b均为有理数，直接相乘
            if (b instanceof rational) return new rational(a.self * b.self, a.divisor * b.divisor);
            //a有理数，b无理数，创建单项式
            if (b instanceof irrational) return new monomial(a, b, undefined);
            //a有理数，b未知数，创建单项式
            if (b instanceof uncertain) return new monomial(a, undefined, [b]);
            if (b instanceof Array) return new monomial(a, undefined, b);
            //a有理数，b单项式
            if (b instanceof monomial) return new monomial(<rational>a.mul(b.rational), b.irrational, b.uncertains);
            //a有理数，b多项式，每项乘以a
            if (b instanceof polynomial) {
                for (var i: number = 0; i < b.length(); i++)
                    if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUnkown())
                        b.monomials[i] = <monomial>a.mul(b.monomials[i]);
                return b;
            }
        }
        if (a instanceof irrational) {
            //a无理数，b有理数，复用方法
            if (b instanceof rational) return b.mul(a);
            //a，b均为无理数，若均为常量则指数相加，若均为平方根则根号下相乘
            if (b instanceof irrational)
                if (a instanceof specialConst && a.equals(b)) return new specialConst(a.type, a.exponent + (<specialConst>b).exponent);
                else if (a instanceof squareRoot && b instanceof squareRoot) return squareRoot.create(a.self * b.self);
            //a无理数，b未知数，创建单项式
            if (b instanceof uncertain) return new monomial(undefined, a, [b]);
            if (b instanceof Array) return new monomial(undefined, a, b);
            //a无理数，b单项式
            if (b instanceof monomial)
                if (b.irrational == undefined) return new monomial(b.rational, a, b.uncertains);
                else return new monomial(b.rational, undefined, b.uncertains).mul(a.mul(b.irrational));
            //a无理数，b多项式
            if (b instanceof polynomial) {
                for (var i: number = 0; i < b.length(); i++) {
                    var re: realComputable | uncertain[] = b.monomials[i].mul(a);
                    if (re instanceof rational) b.monomials[i] = new monomial(re, undefined, undefined);
                    else if (re instanceof irrational) b.monomials[i] = new monomial(undefined, re, undefined);
                    else if (re instanceof monomial) b.monomials[i] = re;
                    else if (re instanceof uncertain) b.monomials[i] = new monomial(undefined, undefined, [re]);
                    else if (re instanceof Array) b.monomials[i] = new monomial(undefined, undefined, re);
                    else throw new Error("返回的运算值无效: " + re);
                }
                return b;
            }
        }
        if (a instanceof uncertain) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof rational || b instanceof irrational) return realComputable.mulReal(b, a);
            //a，b均为未知数
            if (b instanceof uncertain)
                if (a.symbol == b.symbol) return new uncertain(a.symbol, a.exponent + b.exponent);
                else return [a, b];
            if (b instanceof Array) {
                //***需要实现
            }
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof monomial)
                if (b.hasUnkown())
                    if (b.uncertains.length == 1 && b.uncertains[0].equals(a)) return new monomial(b.rational, b.irrational, [<uncertain>a.mul(b.uncertains[0])]);
                    else return new monomial(b.rational, b.irrational, uncertainAdd(b.uncertains, a))
                else return new monomial(b.rational, b.irrational, [a]);
            //a未知数，b多项式
            if (b instanceof polynomial) {
                for (var i: number = 0; i < b.length(); i++) {
                    var re: realComputable | uncertain[] = b.monomials[i].mul(a);
                    if (re instanceof rational) b.monomials[i] = new monomial(re, undefined, undefined);
                    else if (re instanceof irrational) b.monomials[i] = new monomial(undefined, re, undefined);
                    else if (re instanceof monomial) b.monomials[i] = re;
                    else if (re instanceof uncertain) b.monomials[i] = new monomial(undefined, undefined, [re]);
                    else if (re instanceof Array) b.monomials[i] = new monomial(undefined, undefined, re);
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
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain) return realComputable.mulReal(b, a);
            if (a instanceof Array) {
                // ***需要实现
            }
            if (a instanceof polynomial) {
                // ***需要实现
            }
        }
        //a为多项式，复用方法
        if (a instanceof polynomial)
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain || b instanceof Array || b instanceof monomial) return realComputable.mulReal(b, a);
        if (b instanceof polynomial) {
            //***需要实现
        }
        throw new Error("未定义的运算:mul(" + a + "," + b + ")");
    }
    //进度: 已完成equals(a,b)。
    static equals(a: realComputable, b: realComputable): boolean {
        if (a == b) return true;
        if (a instanceof rational) {
            if (b instanceof rational)
                return a.self == b.self && a.divisor == b.divisor;
            if (b instanceof constItem)
                return !b.hasIrrational() && realComputable.equals(a, b.rational);
            if (b instanceof monomial)
                return !b.hasIrrational() && !b.hasUnkown() && realComputable.equals(a, b.const.rational);
        }
        if (a instanceof irrational) {
            if (b instanceof irrational)
                return irrational.irrationalEquals(a, b);
            if (b instanceof constItem)
                return !b.hasRational() && realComputable.equals(a, b.irrational);
            if (b instanceof monomial)
                return !b.hasRational() && !b.hasUnkown() && realComputable.equals(a, b.const.irrational);
        }
        if (a instanceof constItem) {
            if (b instanceof rational)
                return !a.hasIrrational() && realComputable.equals(a.rational, b);
            if (b instanceof irrational)
                return !a.hasRational() && realComputable.equals(a.irrational, b);
            if (b instanceof constItem)
                return ((a.hasRational() && b.hasRational() && realComputable.equals(a.rational, b.rational)) || (!a.hasRational() && !b.hasRational())) && ((a.hasIrrational() && b.hasIrrational() && realComputable.equals(a.irrational, b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()));
            if (b instanceof monomial)
                return !b.hasUnkown() && realComputable.equals(a, b.const);
        }
        if (a instanceof uncertain) {
            if (b instanceof uncertain)
                return a.symbol == b.symbol && a.exponent == b.exponent;
            if (b instanceof uncertainItem)
                return b.uncertains.length == 1 && realComputable.equals(a, b.uncertains[0]);
            if (b instanceof monomial)
                return !b.hasRational() && !b.hasIrrational() && realComputable.equals(a, b.uncertains);
        }
        if (a instanceof uncertainItem) {
            if (b instanceof uncertain)
                return a.uncertains.length == 1 && realComputable.equals(a.uncertains[0], b);
            if (b instanceof uncertainItem)
                if (a.uncertains.length == b.uncertains.length) {
                    for (var i: number = 0; i < a.uncertains.length; i++)
                        if (!realComputable.equals(a.uncertains[i], b.uncertains[i]))
                            return false;
                    return true;
                }
            if (b instanceof monomial)
                return !b.hasRational() && !b.hasIrrational() && realComputable.equals(a, b.uncertains);
        }
        if (a instanceof monomial) {
            if (b instanceof rational || b instanceof irrational || b instanceof constItem || b instanceof uncertain || b instanceof uncertainItem)
                return realComputable.equals(b, a);
            if (b instanceof monomial)
                return realComputable.equals(a.const, b.const) && realComputable.equals(a.uncertains, b.uncertains);
        }
        if (a instanceof polynomial)
            if (b instanceof polynomial) {
                if (a.monomials.length == b.monomials.length) {
                    for (var i: number = 0; i < a.length(); i++)if (!realComputable.equals(a.monomials[i], b.monomials[i])) return false;
                    return true;
                }
            }
        return false;
    }
    //static constItemEquals(a: ConstItem, b: ConstItem): boolean { return a.rational.equals(b.rational) && a.irrational.equals(b.irrational); }
    abstract opp(): realComputable;
    abstract rec(): realComputable;
    add(n: realComputable): realComputable { return realComputable.addReal(this, n); }
    min(n: realComputable): realComputable { return this.add(n.opp()); }
    mul(n: realComputable): realComputable { { return realComputable.mulReal(this, n); } }
    div(n: realComputable): realComputable { return this.mul(n.rec()); }
    equals(n: realComputable): boolean { return realComputable.equals(this, n); }
}
class uncertain extends realComputable {
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
    //Squ(): uncertain { return new uncertain(this.symbol, this.exponent * this.exponent, true); }
    opp(): monomial { return monomial.createComplete(rational.MinusOne, undefined, new uncertainItem([this])); }
    rec(): uncertain { return new uncertain(this.symbol, -this.exponent, true); }
}
function toInt(o: number): number {
    var i = o.toString().indexOf('.');
    if (i >= 0) throw new Error("无效的小数");
    return o;
}
class rational extends realComputable {
    public static readonly One: rational = new rational(1, 1, true);
    public static readonly Zero: rational = new rational(0, 1, true);
    public static readonly MinusOne: rational = new rational(-1, 1, true);
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
    Squ(): rational { return new rational(this.self * this.self, this.divisor); }
    Abs(): rational { return new rational(Math.abs(this.self), this.divisor); }
    opp(): rational { return new rational(-this.self, this.divisor); }
    rec(): rational { return new rational(this.divisor, this.self); }
}
abstract class irrational extends realComputable {
    public static irrationalEquals(a: irrational, b: irrational): boolean {
        if (a instanceof specialConst) {
            if (b instanceof specialConst) return a.type == b.type && a.exponent == b.exponent;
            if (b instanceof specialConstItem) return b.consts.length == 1 && this.irrationalEquals(a, b.consts[0]);
            if (b instanceof irrationalItem) return !b.hasSquareRoot() && b.consts && b.consts.length() == 1 && this.irrationalEquals(a, b.consts[0]);
        }
        if (a instanceof specialConstItem) {
            if (b instanceof specialConst) return this.irrationalEquals(b, a);
            if (b instanceof specialConstItem) {
                if (a.consts.length == b.consts.length) {
                    for (var i: number = 0; i < a.consts.length; i++)
                        if (!this.irrationalEquals(a.consts[i], b.consts[i])) return false;
                    return true;
                }
            }
            if (b instanceof irrationalItem) return !b.hasSquareRoot() && this.irrationalEquals(a, b.consts);
        }
        if (a instanceof squareRoot) {
            if (b instanceof squareRoot) return a.self == b.self;
            if (b instanceof irrationalItem) return !b.hasConsts() && b.squareRoot && a.self == b.squareRoot.self;
        }
        if (a instanceof irrationalItem) {
            if (a.hasConsts()) {
                if (a.hasSquareRoot()) return b instanceof irrationalItem && b.hasConsts() && b.hasSquareRoot() && this.irrationalEquals(a.consts, b.consts) && this.irrationalEquals(a.squareRoot, b.squareRoot);
                return this.irrationalEquals(a.consts, b);
            }
            return this.irrationalEquals(a.squareRoot, b);
        }
        return false;
    }
    opp(): constItem { return new constItem(rational.MinusOne, irrationalItem.create(this)) }
    abstract rec(): rational | irrational | constItem;
}
class specialConst extends irrational {
    public readonly exponent: number;
    rec(): specialConst { return new specialConst(this.type, -this.exponent, true); }
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
class squareRoot extends irrational {
    rec(): constItem { return new constItem(new rational(1, this.self), irrationalItem.create(this)); }
    public readonly self: number;
    private constructor(s: number) {
        super();
        this.self = s;
    }
    public static unsafeCreate(s: number): squareRoot { return new squareRoot(s); }
    public static create(s: number): squareRoot | rational | constItem {
        var index: number = 2;
        var cu: number = SquareNumber[0];
        var r: number = 1;
        while (cu <= s && index <= MaxSquareBase - 1) {
            if (s % cu == 0) {
                r *= index;
                s /= cu;
                if (s == 1) return new rational(r, 1);
            } else {
                index++;
                cu = SquareNumber[index - 2];
            }
        }
        if (r == 1) return new squareRoot(s);
        return new constItem(new rational(r, 1), irrationalItem.create(new squareRoot(s)));
    }
}
class constItem extends realComputable {
    public hasRational(): boolean { return !this.rational.equals(rational.One); }
    public hasIrrational(): boolean { return this.irrational != undefined; }
    opp(): constItem { return new constItem(this.rational.opp(), this.irrational); }
    rec(): constItem { return <constItem>realComputable.mulReal(this.rational.rec(), this.irrational.rec()); }
    public readonly rational: rational;
    public readonly irrational: irrationalItem;
    constructor(r: rational = rational.One, i?: irrationalItem) {
        super();
        this.rational = r;
        this.irrational = i;
    }
}
class specialConstItem extends irrational {
    public readonly consts: specialConst[];
    constructor(c: specialConst[]) {
        super();
        if (c && c.length > 0) this.consts = c;
        else throw new Error("无法构造无内容的特殊常数项");
    }
    public static create(...c: specialConst[]): specialConstItem { return new specialConstItem(c); }
    rec(): specialConstItem {
        var ts: specialConst[] = new specialConst[this.consts.length];
        for (var i: number = 0; i < ts.length; i++)
            ts[i] = new specialConst(this.consts[i].type, - this.consts[i].exponent);
        return new specialConstItem(ts);
    }
    public length(): number { return this.consts.length; }
}
class irrationalItem extends irrational {
    public hasSquareRoot(): boolean { return this.squareRoot != undefined; }
    public hasConsts(): boolean { return this.consts != undefined; }
    //public constLength():number{return consts}
    public readonly consts: specialConstItem;
    public readonly squareRoot: squareRoot;
    private constructor(i: irrational[]) {
        super();
        if (i.length <= 0) throw new Error("无法构造无内容的无理数项");
        var ts: specialConst[];
        for (var a: number = 0; a < i.length; a++)
            if (i[a] instanceof specialConst) ts[ts.length] = copyObject(<specialConst>i[a]);
            else if (i[a] instanceof squareRoot) this.squareRoot = <squareRoot>i[a];
            else throw new Error("此无理数尚未定义: " + i[a]);
        if (ts && ts.length > 0) this.consts = new specialConstItem(ts);
    }
    public static create(...i: irrational[]): irrationalItem { return this.createByArray(i); }
    public static createByArray(i: irrational[]): irrationalItem {
        if (i.length == 1 && i[0] instanceof irrationalItem) return <irrationalItem>i[0];
        return new irrationalItem(i);
    }
    opp(): constItem { return new constItem(rational.MinusOne, this); }
    rec(): irrational | irrationalItem | constItem {
        var re: any = rational.One;
        if (this.hasConsts()) {
            for (var i: number = 0; i < this.consts.length(); i++)
                re = realComputable.mulReal(re, this.consts.consts[i]);
        }
        if (this.hasSquareRoot()) re = realComputable.mulReal(re, this.squareRoot);
        return re;
    }
    //public static create(...i: Irrational[]): IrrationalItem { return new IrrationalItem(i); }
}
class uncertainItem extends realComputable {
    public readonly uncertains: uncertain[];
    length(): number { return this.uncertains.length; }
    constructor(u: uncertain[]) {
        super();
        if (!u || u.length <= 0) throw new Error("无法构造无内容的未知数项");
        this.uncertains = u;
    }
    opp(): monomial { return monomial.createComplete(rational.MinusOne, undefined, this); }
    rec(): uncertainItem {
        var tu: uncertain[] = copyObject(this.uncertains);
        for (var i: number = 0; i < tu.length; i++)
            tu[i] = new uncertain(tu[i].symbol, -tu[i].exponent);
        return new uncertainItem(tu);
    }
}
class monomial extends realComputable {
    public hasRational(): boolean { return this.const.hasRational(); }
    public hasIrrational(): boolean { return this.const.hasIrrational(); }
    public hasUnkown(): boolean { return this.uncertains != undefined; }
    public readonly const: constItem;
    public readonly uncertains: uncertainItem;
    private constructor(c: constItem, u: uncertainItem) {
        super();
        this.const = c ? c : new constItem(rational.One, undefined);
        if (u && u.length() > 0)
            this.uncertains = u;
    }
    public static createComplete(r: rational = rational.One, i?: irrational[], u?: uncertainItem): monomial { return new monomial(new constItem(r, irrationalItem.createByArray(i)), u); }
    public static create(i: rational | irrational | constItem | uncertain | uncertainItem) {
        if (i instanceof rational) return new monomial(new constItem(i), undefined);
        if (i instanceof specialConst || i instanceof squareRoot) return new monomial(new constItem(undefined, irrationalItem.create(i)), undefined);
        if (i instanceof specialConstItem) return new monomial(new constItem(undefined, irrationalItem.createByArray(i.consts)), undefined);
        if (i instanceof irrationalItem) return new monomial(new constItem(undefined, i), undefined);
        if (i instanceof constItem) return new monomial(i, undefined);
        if (i instanceof uncertain) return new monomial(undefined, new uncertainItem([i]));
        if (i instanceof uncertainItem) return new monomial(undefined, i);
        throw new Error("此对象无法用于构造单项式: " + i);
    }
    opp(): monomial { return new monomial(this.const.opp(), this.uncertains); }
    rec(): monomial {
        var nu: uncertainItem = copyObject(this.uncertains);
        if (nu)
            for (var i: number; i < nu.length(); i++)
                nu.uncertains[i] = nu.uncertains[i].rec();
        return new monomial(this.const.rec(), this.uncertains.rec());
    }
}
class polynomial extends realComputable {
    public readonly monomials: monomial[];
    length(): number { return this.monomials.length; }
    private constructor(m: monomial[]) {
        super();
        //if (!m || m.length <= 0) throw new Error("无法构造无内容的多项式");
        this.monomials = m;
    }
    static create(...m: monomial[]): monomial | polynomial {
        if (!m || m.length <= 0) throw new Error("无法构造无内容的多项式");
        if (m.length == 1) return m[0];
        return new polynomial(m);
    }
    opp(): polynomial {
        var _m = <monomial[]>copyObject(this.monomials);
        for (var i: number; i < _m.length; i++)
            _m[i] = _m[i].opp();
        return new polynomial(_m);
    }
    rec(): monomial {
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