var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
Copyright © 2020 ll rights reserved.
Author: LonelyDagger, Passthem, Tealing
Released on teable.top/math
DONOT DISTRIBUTE! VIOLATORS WILL BE DEALT WITH ACCORDING TO LAW.
 */
var advisedMaxNumber = 1e10;
// {I don't know how many} Errors left. Old version file: Real.old.ts(No errors but with less expansibility and implement)
function copyObject(origin) { return Object.create(origin).__proto__; }
var realComputable = /** @class */ (function () {
    function realComputable() {
    }
    realComputable.addReal = function (a, b) {
        if (b == undefined)
            return a;
        if (a instanceof rational) {
            //a，b均为有理数，分数通分加减法(Rational构造函数负责化简)
            if (b instanceof rational)
                return new rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
            //a有理数，b无理数/未知数，创建多项式
            if (b instanceof irrational || b instanceof uncertain || b instanceof uncertainItem)
                return polynomial.create(monomial.create(a), monomial.create(b));
            if (b instanceof constItem)
                if (b.hasIrrational())
                    return polynomial.create(monomial.create(a), monomial.create(b));
                else
                    return realComputable.addReal(a, b.rational);
            //a有理数，b单项式
            if (b instanceof monomial)
                //若b不含无理数和未知数，将有理数部分相加
                if (!b.hasIrrational() && !b.hasUnkown())
                    return realComputable.addReal(a, b["const"].rational);
                //否则创建多项式
                else
                    return polynomial.create(monomial.create(a), b);
            //a有理数，b多项式
            if (b instanceof polynomial) {
                //遍历b中每一项
                for (var i = 0; i < b.length(); i++)
                    //若b中某一项不含无理数和未知数，将有理数部分相加
                    if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = monomial.create(realComputable.addReal(a, b.monomials[i]["const"].rational));
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = monomial.create(a);
                return b;
            }
        }
        if (a instanceof irrational) {
            //a无理数，b有理数，复用方法
            if (b instanceof rational)
                return b.add(a);
            //a，b均为无理数，判断无理数是否相等，相等返回2a，否则创建多项式
            if (b instanceof irrational)
                if (a.equals(b))
                    return new constItem(new rational(2, 1, true), irrationalItem.create(a));
                else
                    return polynomial.create(monomial.create(a), monomial.create(b));
            //a无理数，b未知数，创建多项式
            if (b instanceof uncertain)
                return polynomial.create(new monomial(undefined, a, undefined), new monomial(undefined, undefined, [b]));
            if (b instanceof Array)
                return polynomial.create(new monomial(undefined, a, undefined), new monomial(undefined, undefined, b));
            //a无理数，b单项式
            if (b instanceof monomial)
                //若b中无理数等于a且不含未知数，将有理数部分+1
                if (a && a.equals(b.irrational) && !b.hasUnkown())
                    return new monomial(b.rational.add(rational.One), a, undefined);
                //否则创建多项式
                else
                    return polynomial.create(new monomial(undefined, a, undefined), b);
            //a无理数，b多项式
            if (b instanceof polynomial) {
                for (var i = 0; i < b.length(); i++)
                    //若b中某一项无理数等于a且不含未知数，将有理数部分+1
                    if (b.monomials[i].irrational.equals(a) && !b.monomials[i].hasUnkown()) {
                        b.monomials[i] = new monomial(rational.One.add(b.monomials[i].rational), a);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = new monomial(undefined, a, undefined);
                return b;
            }
        }
        if (a instanceof uncertain) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof rational || b instanceof irrational)
                return realComputable.addReal(b, a);
            //a，b均为未知数，如果符号和指数相同，返回2a，否则创建多项式
            if (b instanceof uncertain)
                if (a.symbol == b.symbol && a.exponent == b.exponent)
                    return new monomial(new rational(2, 1), undefined, [a]);
                else
                    return polynomial.create(new monomial(undefined, undefined, [a]), new monomial(undefined, undefined, [b]));
            if (b instanceof Array)
                if (b.length == 1 && a.equals(b[0]))
                    return new monomial(new rational(2, 1), undefined, b);
                else
                    return polynomial.create(new monomial(undefined, undefined, [a]), new monomial(undefined, undefined, b));
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof monomial)
                if (!b.hasIrrational && b.hasUnkown() && b.uncertains.length == 1 && b.uncertains[0].equals(a))
                    return new monomial(rational.One.add(b.rational), undefined, [a]);
                else
                    return polynomial.create(new monomial(undefined, undefined, [a]), b);
            //a未知数，b多项式
            if (b instanceof polynomial) {
                for (var i = 0; i < b.length(); i++)
                    //若b中某一项不含无理数且未知数符号和指数等于a，将有理数部分+1
                    if (!b.monomials[i].hasIrrational() && b.monomials[i].hasUnkown() && b.monomials[i].uncertains.length == 1 && b.monomials[i].equals(a)) {
                        b.monomials[i] = new monomial(rational.One.add(b.monomials[i].rational), undefined, [a]);
                        return b;
                    }
                //否则在多项式中添加一项
                b.monomials[i] = new monomial(undefined, undefined, [a]);
                return b;
            }
        }
        if (a instanceof monomial) {
            //a单项式，b为有理数或无理数或未知数，复用方法
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain)
                return realComputable.addReal(b, a);
            if (b instanceof Array) {
                if (uncertainEquals(a.uncertains, b))
                    return new monomial(realComputable.addReal(a.rational, rational.One), a.irrational, b);
                else
                    return polynomial.create(a, new monomial(undefined, undefined, b));
            }
            //a，b均为单项式
            if (b instanceof monomial) {
                //a，b无理数部分相同或不含无理数
                if ((a.hasIrrational() && b.hasIrrational() && a.irrational.equals(b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()))
                    //若a，b均含未知数且完全相同，或a，b均不含未知数，则将有理数部分相加
                    if (uncertainEquals(a.uncertains, b.uncertains))
                        return new monomial(realComputable.addReal(a.rational, b.rational), a.irrational, a.uncertains);
                //否则连接a，b创建多项式
                return polynomial.create(a, b);
            }
            if (b instanceof polynomial) {
                for (var i = 0; i < b.length(); i++)
                    //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
                    if (((a.hasIrrational() && b.monomials[i].hasIrrational() && a.irrational.equals(b.monomials[i].irrational)) || (!a.hasIrrational() && !b.monomials[i].hasIrrational())) && (uncertainEquals(a.uncertains, b.monomials[i].uncertains))) {
                        b.monomials[i] = new monomial(a.rational.add(b.monomials[i].rational), a.irrational, a.uncertains);
                    }
                //否则在多项式中添加一项
                b.monomials[i] = a;
                return b;
            }
        }
        if (a instanceof Array) {
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain || b instanceof monomial)
                return realComputable.addReal(b, a);
            if (b instanceof Array)
                if (uncertainEquals(a, b))
                    return new monomial(new rational(2, 1), undefined, a);
                else
                    return polynomial.create(new monomial(undefined, undefined, a), new monomial(undefined, undefined, b));
            if (b instanceof polynomial) {
                for (var i = 0; i < b.length(); i++) {
                    if (uncertainEquals(a, b.monomials[i].uncertains))
                        b.monomials[i] = new monomial(realComputable.addReal(rational.One, b.monomials[i].rational), b.monomials[i].irrational, a);
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
    };
    //进度: 正在实现mulReal(a,b)，缺少较多类型的运算实现(Ctrl+F搜索"需要实现")
    realComputable.mulReal = function (a, b) {
        if (b == undefined)
            return a;
        if (a instanceof rational) {
            //a=0，不运算
            if (a.equals(rational.Zero))
                return rational.Zero;
            if (a.equals(rational.One))
                return b;
            //a，b均为有理数，直接相乘
            if (b instanceof rational)
                return new rational(a.self * b.self, a.divisor * b.divisor);
            //a有理数，b无理数，创建单项式
            if (b instanceof irrational)
                return new monomial(a, b, undefined);
            //a有理数，b未知数，创建单项式
            if (b instanceof uncertain)
                return new monomial(a, undefined, [b]);
            if (b instanceof Array)
                return new monomial(a, undefined, b);
            //a有理数，b单项式
            if (b instanceof monomial)
                return new monomial(a.mul(b.rational), b.irrational, b.uncertains);
            //a有理数，b多项式，每项乘以a
            if (b instanceof polynomial) {
                for (var i = 0; i < b.length(); i++)
                    if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUnkown())
                        b.monomials[i] = a.mul(b.monomials[i]);
                return b;
            }
        }
        if (a instanceof irrational) {
            //a无理数，b有理数，复用方法
            if (b instanceof rational)
                return b.mul(a);
            //a，b均为无理数，若均为常量则指数相加，若均为平方根则根号下相乘
            if (b instanceof irrational)
                if (a instanceof specialConst && a.equals(b))
                    return new specialConst(a.type, a.exponent + b.exponent);
                else if (a instanceof squareRoot && b instanceof squareRoot)
                    return squareRoot.create(a.self * b.self);
            //a无理数，b未知数，创建单项式
            if (b instanceof uncertain)
                return new monomial(undefined, a, [b]);
            if (b instanceof Array)
                return new monomial(undefined, a, b);
            //a无理数，b单项式
            if (b instanceof monomial)
                if (b.irrational == undefined)
                    return new monomial(b.rational, a, b.uncertains);
                else
                    return new monomial(b.rational, undefined, b.uncertains).mul(a.mul(b.irrational));
            //a无理数，b多项式
            if (b instanceof polynomial) {
                for (var i = 0; i < b.length(); i++) {
                    var re = b.monomials[i].mul(a);
                    if (re instanceof rational)
                        b.monomials[i] = new monomial(re, undefined, undefined);
                    else if (re instanceof irrational)
                        b.monomials[i] = new monomial(undefined, re, undefined);
                    else if (re instanceof monomial)
                        b.monomials[i] = re;
                    else if (re instanceof uncertain)
                        b.monomials[i] = new monomial(undefined, undefined, [re]);
                    else if (re instanceof Array)
                        b.monomials[i] = new monomial(undefined, undefined, re);
                    else
                        throw new Error("返回的运算值无效: " + re);
                }
                return b;
            }
        }
        if (a instanceof uncertain) {
            //a未知数，b为有理数或无理数，复用方法
            if (b instanceof rational || b instanceof irrational)
                return realComputable.mulReal(b, a);
            //a，b均为未知数
            if (b instanceof uncertain)
                if (a.symbol == b.symbol)
                    return new uncertain(a.symbol, a.exponent + b.exponent);
                else
                    return [a, b];
            if (b instanceof Array) {
                //***需要实现
            }
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof monomial)
                if (b.hasUnkown())
                    if (b.uncertains.length == 1 && b.uncertains[0].equals(a))
                        return new monomial(b.rational, b.irrational, [a.mul(b.uncertains[0])]);
                    else
                        return new monomial(b.rational, b.irrational, uncertainAdd(b.uncertains, a));
                else
                    return new monomial(b.rational, b.irrational, [a]);
            //a未知数，b多项式
            if (b instanceof polynomial) {
                for (var i = 0; i < b.length(); i++) {
                    var re = b.monomials[i].mul(a);
                    if (re instanceof rational)
                        b.monomials[i] = new monomial(re, undefined, undefined);
                    else if (re instanceof irrational)
                        b.monomials[i] = new monomial(undefined, re, undefined);
                    else if (re instanceof monomial)
                        b.monomials[i] = re;
                    else if (re instanceof uncertain)
                        b.monomials[i] = new monomial(undefined, undefined, [re]);
                    else if (re instanceof Array)
                        b.monomials[i] = new monomial(undefined, undefined, re);
                    else
                        throw new Error("返回的运算值无效: " + re);
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
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain)
                return realComputable.mulReal(b, a);
            if (a instanceof Array) {
                // ***需要实现
            }
            if (a instanceof polynomial) {
                // ***需要实现
            }
        }
        //a为多项式，复用方法
        if (a instanceof polynomial)
            if (b instanceof rational || b instanceof irrational || b instanceof uncertain || b instanceof Array || b instanceof monomial)
                return realComputable.mulReal(b, a);
        if (b instanceof polynomial) {
            //***需要实现
        }
        throw new Error("未定义的运算:mul(" + a + "," + b + ")");
    };
    //进度: 已完成equals(a,b)。
    realComputable.equals = function (a, b) {
        if (a == b)
            return true;
        if (a instanceof rational) {
            if (b instanceof rational)
                return a.self == b.self && a.divisor == b.divisor;
            if (b instanceof constItem)
                return !b.hasIrrational() && realComputable.equals(a, b.rational);
            if (b instanceof monomial)
                return !b.hasIrrational() && !b.hasUnkown() && realComputable.equals(a, b["const"].rational);
        }
        if (a instanceof irrational) {
            if (b instanceof irrational)
                return irrational.irrationalEquals(a, b);
            if (b instanceof constItem)
                return !b.hasRational() && realComputable.equals(a, b.irrational);
            if (b instanceof monomial)
                return !b.hasRational() && !b.hasUnkown() && realComputable.equals(a, b["const"].irrational);
        }
        if (a instanceof constItem) {
            if (b instanceof rational)
                return !a.hasIrrational() && realComputable.equals(a.rational, b);
            if (b instanceof irrational)
                return !a.hasRational() && realComputable.equals(a.irrational, b);
            if (b instanceof constItem)
                return ((a.hasRational() && b.hasRational() && realComputable.equals(a.rational, b.rational)) || (!a.hasRational() && !b.hasRational())) && ((a.hasIrrational() && b.hasIrrational() && realComputable.equals(a.irrational, b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()));
            if (b instanceof monomial)
                return !b.hasUnkown() && realComputable.equals(a, b["const"]);
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
                    for (var i = 0; i < a.uncertains.length; i++)
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
                return realComputable.equals(a["const"], b["const"]) && realComputable.equals(a.uncertains, b.uncertains);
        }
        if (a instanceof polynomial)
            if (b instanceof polynomial) {
                if (a.monomials.length == b.monomials.length) {
                    for (var i = 0; i < a.length(); i++)
                        if (!realComputable.equals(a.monomials[i], b.monomials[i]))
                            return false;
                    return true;
                }
            }
        return false;
    };
    realComputable.prototype.add = function (n) { return realComputable.addReal(this, n); };
    realComputable.prototype.min = function (n) { return this.add(n.opp()); };
    realComputable.prototype.mul = function (n) { {
        return realComputable.mulReal(this, n);
    } };
    realComputable.prototype.div = function (n) { return this.mul(n.rec()); };
    realComputable.prototype.equals = function (n) { return realComputable.equals(this, n); };
    return realComputable;
}());
var uncertain = /** @class */ (function (_super) {
    __extends(uncertain, _super);
    function uncertain(s, e, v) {
        if (v === void 0) { v = false; }
        var _this = _super.call(this) || this;
        _this.symbol = s;
        if (v)
            _this.exponent = t;
        else {
            if (!s || s.length != 1)
                throw new Error("未知数的命名无效");
            var t = toInt(e);
            if (t == 0)
                throw new Error("将不会对未知数进行零次幂运算。请尝试改用\"1\"");
        }
        return _this;
    }
    //Squ(): uncertain { return new uncertain(this.symbol, this.exponent * this.exponent, true); }
    uncertain.prototype.opp = function () { return monomial.createComplete(rational.MinusOne, undefined, new uncertainItem([this])); };
    uncertain.prototype.rec = function () { return new uncertain(this.symbol, -this.exponent, true); };
    return uncertain;
}(realComputable));
function toInt(o) {
    var i = o.toString().indexOf('.');
    if (i >= 0)
        throw new Error("无效的小数");
    return o;
}
var rational = /** @class */ (function (_super) {
    __extends(rational, _super);
    function rational(s, d, v) {
        var _this = _super.call(this) || this;
        if (!v) {
            if (d == 0)
                throw new Error("分母不能为0");
            if (s == 0)
                d = 1;
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
        _this.self = s;
        _this.divisor = d;
        return _this;
    }
    rational.prototype.Squ = function () { return new rational(this.self * this.self, this.divisor); };
    rational.prototype.Abs = function () { return new rational(Math.abs(this.self), this.divisor); };
    rational.prototype.opp = function () { return new rational(-this.self, this.divisor); };
    rational.prototype.rec = function () { return new rational(this.divisor, this.self); };
    rational.One = new rational(1, 1, true);
    rational.Zero = new rational(0, 1, true);
    rational.MinusOne = new rational(-1, 1, true);
    return rational;
}(realComputable));
var irrational = /** @class */ (function (_super) {
    __extends(irrational, _super);
    function irrational() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    irrational.irrationalEquals = function (a, b) {
        if (a instanceof specialConst) {
            if (b instanceof specialConst)
                return a.type == b.type && a.exponent == b.exponent;
            if (b instanceof specialConstItem)
                return b.consts.length == 1 && this.irrationalEquals(a, b.consts[0]);
            if (b instanceof irrationalItem)
                return !b.hasSquareRoot() && b.consts && b.consts.length() == 1 && this.irrationalEquals(a, b.consts[0]);
        }
        if (a instanceof specialConstItem) {
            if (b instanceof specialConst)
                return this.irrationalEquals(b, a);
            if (b instanceof specialConstItem) {
                if (a.consts.length == b.consts.length) {
                    for (var i = 0; i < a.consts.length; i++)
                        if (!this.irrationalEquals(a.consts[i], b.consts[i]))
                            return false;
                    return true;
                }
            }
            if (b instanceof irrationalItem)
                return !b.hasSquareRoot() && this.irrationalEquals(a, b.consts);
        }
        if (a instanceof squareRoot) {
            if (b instanceof squareRoot)
                return a.self == b.self;
            if (b instanceof irrationalItem)
                return !b.hasConsts() && b.squareRoot && a.self == b.squareRoot.self;
        }
        if (a instanceof irrationalItem) {
            if (a.hasConsts()) {
                if (a.hasSquareRoot())
                    return b instanceof irrationalItem && b.hasConsts() && b.hasSquareRoot() && this.irrationalEquals(a.consts, b.consts) && this.irrationalEquals(a.squareRoot, b.squareRoot);
                return this.irrationalEquals(a.consts, b);
            }
            return this.irrationalEquals(a.squareRoot, b);
        }
        return false;
    };
    irrational.prototype.opp = function () { return new constItem(rational.MinusOne, irrationalItem.create(this)); };
    return irrational;
}(realComputable));
var specialConst = /** @class */ (function (_super) {
    __extends(specialConst, _super);
    function specialConst(t, e, v) {
        if (t === void 0) { t = ConstType.Pi; }
        if (e === void 0) { e = 1; }
        if (v === void 0) { v = false; }
        var _this = _super.call(this) || this;
        if (v)
            _this.exponent = e;
        else {
            if (e == 0)
                throw new Error("将不会对特殊常量进行零次幂运算。请尝试改用\"1\"");
            var ei = toInt(e);
            _this.exponent = ei;
        }
        _this.type = t;
        return _this;
    }
    specialConst.prototype.rec = function () { return new specialConst(this.type, -this.exponent, true); };
    return specialConst;
}(irrational));
var ConstType;
(function (ConstType) {
    ConstType[ConstType["Pi"] = 0] = "Pi";
})(ConstType || (ConstType = {}));
var MaxSquareBase = 50;
function generateSquareNumber() {
    SquareNumber = [];
    for (var i = 0; i < MaxSquareBase - 1; i++)
        SquareNumber[i] = (i + 2) * (i + 2);
}
var SquareNumber = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 676, 729, 784, 841, 900, 961, 1024, 1089, 1156, 1225, 1296, 1369, 1444, 1521, 1600, 1681, 1764, 1849, 1936, 2025, 2116, 2209, 2304, 2401, 2500];
if (!SquareNumber)
    generateSquareNumber();
//function CreateSquareRoot(s: number): Monomial | SquareRoot | Rational { return SquareRoot.Create(s); }
var squareRoot = /** @class */ (function (_super) {
    __extends(squareRoot, _super);
    function squareRoot(s) {
        var _this = _super.call(this) || this;
        _this.self = s;
        return _this;
    }
    squareRoot.prototype.rec = function () { return new constItem(new rational(1, this.self), irrationalItem.create(this)); };
    squareRoot.unsafeCreate = function (s) { return new squareRoot(s); };
    squareRoot.create = function (s) {
        var index = 2;
        var cu = SquareNumber[0];
        var r = 1;
        while (cu <= s && index <= MaxSquareBase - 1) {
            if (s % cu == 0) {
                r *= index;
                s /= cu;
                if (s == 1)
                    return new rational(r, 1);
            }
            else {
                index++;
                cu = SquareNumber[index - 2];
            }
        }
        if (r == 1)
            return new squareRoot(s);
        return new constItem(new rational(r, 1), irrationalItem.create(new squareRoot(s)));
    };
    return squareRoot;
}(irrational));
var constItem = /** @class */ (function (_super) {
    __extends(constItem, _super);
    function constItem(r, i) {
        if (r === void 0) { r = rational.One; }
        var _this = _super.call(this) || this;
        _this.rational = r;
        _this.irrational = i;
        return _this;
    }
    constItem.prototype.hasRational = function () { return !this.rational.equals(rational.One); };
    constItem.prototype.hasIrrational = function () { return this.irrational != undefined; };
    constItem.prototype.opp = function () { return new constItem(this.rational.opp(), this.irrational); };
    constItem.prototype.rec = function () { return realComputable.mulReal(this.rational.rec(), this.irrational.rec()); };
    return constItem;
}(realComputable));
var specialConstItem = /** @class */ (function (_super) {
    __extends(specialConstItem, _super);
    function specialConstItem(c) {
        var _this = _super.call(this) || this;
        if (c && c.length > 0)
            _this.consts = c;
        else
            throw new Error("无法构造无内容的特殊常数项");
        return _this;
    }
    specialConstItem.create = function () {
        var c = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            c[_i] = arguments[_i];
        }
        return new specialConstItem(c);
    };
    specialConstItem.prototype.rec = function () {
        var ts = new specialConst[this.consts.length];
        for (var i = 0; i < ts.length; i++)
            ts[i] = new specialConst(this.consts[i].type, -this.consts[i].exponent);
        return new specialConstItem(ts);
    };
    specialConstItem.prototype.length = function () { return this.consts.length; };
    return specialConstItem;
}(irrational));
var irrationalItem = /** @class */ (function (_super) {
    __extends(irrationalItem, _super);
    function irrationalItem(i) {
        var _this = _super.call(this) || this;
        if (i.length <= 0)
            throw new Error("无法构造无内容的无理数项");
        var ts;
        for (var a = 0; a < i.length; a++)
            if (i[a] instanceof specialConst)
                ts[ts.length] = copyObject(i[a]);
            else if (i[a] instanceof squareRoot)
                _this.squareRoot = i[a];
            else
                throw new Error("此无理数尚未定义: " + i[a]);
        if (ts && ts.length > 0)
            _this.consts = new specialConstItem(ts);
        return _this;
    }
    irrationalItem.prototype.hasSquareRoot = function () { return this.squareRoot != undefined; };
    irrationalItem.prototype.hasConsts = function () { return this.consts != undefined; };
    irrationalItem.create = function () {
        var i = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            i[_i] = arguments[_i];
        }
        return this.createByArray(i);
    };
    irrationalItem.createByArray = function (i) {
        if (i.length == 1 && i[0] instanceof irrationalItem)
            return i[0];
        return new irrationalItem(i);
    };
    irrationalItem.prototype.opp = function () { return new constItem(rational.MinusOne, this); };
    irrationalItem.prototype.rec = function () {
        var re = rational.One;
        if (this.hasConsts()) {
            for (var i = 0; i < this.consts.length(); i++)
                re = realComputable.mulReal(re, this.consts.consts[i]);
        }
        if (this.hasSquareRoot())
            re = realComputable.mulReal(re, this.squareRoot);
        return re;
    };
    return irrationalItem;
}(irrational));
var uncertainItem = /** @class */ (function (_super) {
    __extends(uncertainItem, _super);
    function uncertainItem(u) {
        var _this = _super.call(this) || this;
        if (!u || u.length <= 0)
            throw new Error("无法构造无内容的未知数项");
        _this.uncertains = u;
        return _this;
    }
    uncertainItem.prototype.length = function () { return this.uncertains.length; };
    uncertainItem.prototype.opp = function () { return monomial.createComplete(rational.MinusOne, undefined, this); };
    uncertainItem.prototype.rec = function () {
        var tu = copyObject(this.uncertains);
        for (var i = 0; i < tu.length; i++)
            tu[i] = new uncertain(tu[i].symbol, -tu[i].exponent);
        return new uncertainItem(tu);
    };
    return uncertainItem;
}(realComputable));
var monomial = /** @class */ (function (_super) {
    __extends(monomial, _super);
    function monomial(c, u) {
        var _this = _super.call(this) || this;
        _this["const"] = c ? c : new constItem(rational.One, undefined);
        if (u && u.length() > 0)
            _this.uncertains = u;
        return _this;
    }
    monomial.prototype.hasRational = function () { return this["const"].hasRational(); };
    monomial.prototype.hasIrrational = function () { return this["const"].hasIrrational(); };
    monomial.prototype.hasUnkown = function () { return this.uncertains != undefined; };
    monomial.createComplete = function (r, i, u) {
        if (r === void 0) { r = rational.One; }
        return new monomial(new constItem(r, irrationalItem.createByArray(i)), u);
    };
    monomial.create = function (i) {
        if (i instanceof rational)
            return new monomial(new constItem(i), undefined);
        if (i instanceof specialConst || i instanceof squareRoot)
            return new monomial(new constItem(undefined, irrationalItem.create(i)), undefined);
        if (i instanceof specialConstItem)
            return new monomial(new constItem(undefined, irrationalItem.createByArray(i.consts)), undefined);
        if (i instanceof irrationalItem)
            return new monomial(new constItem(undefined, i), undefined);
        if (i instanceof constItem)
            return new monomial(i, undefined);
        if (i instanceof uncertain)
            return new monomial(undefined, new uncertainItem([i]));
        if (i instanceof uncertainItem)
            return new monomial(undefined, i);
        throw new Error("此对象无法用于构造单项式: " + i);
    };
    monomial.prototype.opp = function () { return new monomial(this["const"].opp(), this.uncertains); };
    monomial.prototype.rec = function () {
        var nu = copyObject(this.uncertains);
        if (nu)
            for (var i; i < nu.length(); i++)
                nu.uncertains[i] = nu.uncertains[i].rec();
        return new monomial(this["const"].rec(), this.uncertains.rec());
    };
    return monomial;
}(realComputable));
var polynomial = /** @class */ (function (_super) {
    __extends(polynomial, _super);
    function polynomial(m) {
        var _this = _super.call(this) || this;
        //if (!m || m.length <= 0) throw new Error("无法构造无内容的多项式");
        _this.monomials = m;
        return _this;
    }
    polynomial.prototype.length = function () { return this.monomials.length; };
    polynomial.create = function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i] = arguments[_i];
        }
        if (!m || m.length <= 0)
            throw new Error("无法构造无内容的多项式");
        if (m.length == 1)
            return m[0];
        return new polynomial(m);
    };
    polynomial.prototype.opp = function () {
        var _m = copyObject(this.monomials);
        for (var i; i < _m.length; i++)
            _m[i] = _m[i].opp();
        return new polynomial(_m);
    };
    polynomial.prototype.rec = function () {
        if (this.monomials && this.monomials.length == 1)
            return this.monomials[0].rec();
        throw new Error("暂不支持取多项式倒数");
    };
    return polynomial;
}(realComputable));
function greatestCommonDivisor(a, b) {
    var c = a % b;
    if (c == 0) {
        return b;
    }
    return arguments.callee(b, c);
}
