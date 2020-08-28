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
var advisedMaxNumber = 1e10;
var RealComputable = /** @class */ (function () {
    function RealComputable() {
    }
    RealComputable.addReal = function (a, b) {
        if (a instanceof Rational) {
            if (b instanceof Rational)
                return new Rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
            if (b instanceof Irrational)
                return Polynomial.Create(new Monomial(a, undefined, undefined), new Monomial(undefined, b, undefined));
            if (b instanceof Unknown)
                return Polynomial.Create(new Monomial(a, undefined, undefined), new Monomial(undefined, undefined, [b]));
            if (b instanceof Monomial)
                if (!b.hasIrrational && !b.hasUnkown)
                    return a.add(b.rational);
                else
                    return Polynomial.Create(new Monomial(a, undefined, undefined), b);
            if (b instanceof Polynomial) {
                for (var i1 = 0; i1 < b.length(); i1++) {
                    if (!b.monomials[i1].hasIrrational && !b.monomials[i1].hasUnkown) {
                        b.monomials[i1] = new Monomial(a.add(b.monomials[i1].rational));
                        return b;
                    }
                }
                b.monomials[i1 + 1] = new Monomial(a, undefined, undefined);
                return b;
            }
        }
        if (a instanceof Irrational) {
            if (b instanceof Rational)
                return b.add(a);
            if (b instanceof Irrational)
                if (a.equals(b))
                    return new Monomial(new Rational(2, 1, true), a, undefined);
                else
                    return Polynomial.Create(new Monomial(undefined, a, undefined), new Monomial(undefined, b, undefined));
            if (b instanceof Unknown)
                return Polynomial.Create(new Monomial(undefined, a, undefined), new Monomial(undefined, undefined, [b]));
            if (b instanceof Monomial)
                if (a.equals(b.irrational))
                    return new Monomial(b.rational.add(Rational.One), a, undefined);
                else
                    return Polynomial.Create(new Monomial(undefined, a, undefined), b);
        }
        throw new Error("未定义的运算:add(" + a + "," + b + ")");
    };
    RealComputable.mulReal = function (a, b) { return; };
    RealComputable.equals = function (a, b) {
        if (a instanceof Rational)
            if (b instanceof Rational)
                return a.self == b.self && a.divisor == b.divisor;
            else
                return false;
        if (a instanceof Irrational)
            if (b instanceof Irrational)
                return a.irrationalEquals(b);
            else
                return false;
        if (a instanceof Unknown)
            if (b instanceof Unknown)
                return a.symbol == b.symbol && a.exponent == b.exponent;
            else
                return false;
        if (a instanceof Monomial)
            if (b instanceof Monomial)
                return a.rational == b.rational && a.irrational == b.irrational && a.unknowns == b.unknowns;
            else
                return false;
        if (a instanceof Polynomial)
            if (b instanceof Polynomial) {
                for (var i = 0; i < a.length(); i++)
                    if (!a.monomials[i].equals(b.monomials[i]))
                        return false;
                return true;
            }
        return false;
    };
    RealComputable.prototype.add = function (n) { return RealComputable.addReal(this, n); };
    RealComputable.prototype.min = function (n) { return this.add(n.Opp()); };
    RealComputable.prototype.mul = function (n) { {
        return RealComputable.mulReal(this, n);
    } };
    RealComputable.prototype.div = function (n) { return this.mul(n.Rec()); };
    RealComputable.prototype.equals = function (n) { return RealComputable.equals(this, n); };
    return RealComputable;
}());
var Unknown = /** @class */ (function (_super) {
    __extends(Unknown, _super);
    function Unknown(s, e, v) {
        if (v === void 0) { v = false; }
        var _this = _super.call(this) || this;
        CheckNumber(e);
        if (s.length != 1)
            throw new Error("未知数的命名无效");
        _this.symbol = s;
        if (v)
            _this.exponent = t;
        else {
            var t = toInt(e);
            if (t == 0)
                throw new Error("将不会对未知数进行零次幂运算。请尝试改用\"1\"");
        }
        return _this;
    }
    Unknown.prototype.Squ = function () { return new Unknown(this.symbol, this.exponent * this.exponent, true); };
    Unknown.prototype.Opp = function () { return new Monomial(Rational.MinusOne, undefined, [this]); };
    Unknown.prototype.Rec = function () { return new Unknown(this.symbol, -this.exponent, true); };
    return Unknown;
}(RealComputable));
function toInt(o) {
    var i = o.toString().indexOf('.');
    if (i >= 0)
        throw new Error("暂不支持非整数的指数");
    return o;
}
var Rational = /** @class */ (function (_super) {
    __extends(Rational, _super);
    function Rational(s, d, v) {
        var _this = _super.call(this) || this;
        CheckNumber(s);
        CheckNumber(d);
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
                var gcd = GreatestCommonDivisor(s, d);
                s /= gcd;
                d /= gcd;
            }
        }
        _this.self = s;
        _this.divisor = d;
        return _this;
    }
    Rational.prototype.Squ = function () { return new Rational(this.self * this.self, this.divisor); };
    Rational.prototype.Abs = function () { return new Rational(Math.abs(this.self), this.divisor); };
    Rational.prototype.Opp = function () { return new Rational(-this.self, this.divisor); };
    Rational.prototype.Rec = function () { return new Rational(this.divisor, this.self); };
    Rational.One = new Rational(1, 1, true);
    Rational.Zero = new Rational(0, 1, true);
    Rational.MinusOne = new Rational(-1, 1, true);
    return Rational;
}(RealComputable));
var Irrational = /** @class */ (function (_super) {
    __extends(Irrational, _super);
    function Irrational() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Irrational.prototype.Opp = function () { return new Monomial(Rational.MinusOne, this, undefined); };
    return Irrational;
}(RealComputable));
var SpecialConst = /** @class */ (function (_super) {
    __extends(SpecialConst, _super);
    function SpecialConst(t, e, v) {
        if (t === void 0) { t = ConstType.Pi; }
        if (e === void 0) { e = 1; }
        if (v === void 0) { v = false; }
        var _this = _super.call(this) || this;
        CheckNumber(e);
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
    SpecialConst.prototype.irrationalEquals = function (n) { return n instanceof SpecialConst && n.exponent == this.exponent && n.type == this.type; };
    SpecialConst.prototype.Rec = function () { return new SpecialConst(this.type, -this.exponent, true); };
    return SpecialConst;
}(Irrational));
var MaxSquareBase = 50;
(function () {
    SquareNumber = [];
    for (var i = 0; i < MaxSquareBase - 1; i++)
        SquareNumber[i] = (i + 2) * (i + 2);
})();
var SquareNumber;
//function CreateSquareRoot(s: number): Monomial | SquareRoot | Rational { return SquareRoot.Create(s); }
var SquareRoot = /** @class */ (function (_super) {
    __extends(SquareRoot, _super);
    function SquareRoot(s) {
        var _this = this;
        CheckNumber(s);
        _this = _super.call(this) || this;
        _this.self = s;
        return _this;
    }
    SquareRoot.prototype.irrationalEquals = function (n) { return n instanceof SquareRoot && n.self == this.self; };
    SquareRoot.prototype.Rec = function () { return new Monomial(new Rational(1, this.self), this, undefined); };
    SquareRoot.Create = function (s) {
        CheckNumber(s);
        var index = 2;
        var cu = SquareNumber[0];
        var r = 1;
        while (cu <= s && index <= MaxSquareBase - 1) {
            if (s % cu == 0) {
                r *= index;
                s /= cu;
                if (s == 1)
                    return new Rational(r, 1);
            }
            else {
                index++;
                cu = SquareNumber[index - 2];
            }
        }
        if (r == 1)
            return new SquareRoot(s);
        return new Monomial(new Rational(r, 1), new SquareRoot(s), undefined);
    };
    return SquareRoot;
}(Irrational));
var ConstType;
(function (ConstType) {
    ConstType[ConstType["Pi"] = 0] = "Pi";
})(ConstType || (ConstType = {}));
var Monomial = /** @class */ (function (_super) {
    __extends(Monomial, _super);
    function Monomial(r, i, u) {
        if (r === void 0) { r = Rational.One; }
        var _this = _super.call(this) || this;
        _this.rational = r;
        _this.irrational = i;
        if (u && u.length > 0)
            _this.unknowns = u;
        return _this;
    }
    Monomial.prototype.hasRational = function () { return Rational.One.equals(this.rational); };
    Monomial.prototype.hasIrrational = function () { return this.irrational instanceof Irrational; };
    Monomial.prototype.hasUnkown = function () { return this.unknowns != undefined; };
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
    Monomial.prototype.Opp = function () { return new Monomial(this.rational.Opp(), this.irrational, this.unknowns); };
    Monomial.prototype.Rec = function () {
        var nu = this.unknowns;
        if (nu)
            for (var i; i < nu.length; i++)
                nu[i] = nu[i].Rec();
        return new Monomial(this.rational.Rec(), undefined, nu).mul(this.irrational.Rec());
    };
    return Monomial;
}(RealComputable));
var Polynomial = /** @class */ (function (_super) {
    __extends(Polynomial, _super);
    function Polynomial(m) {
        var _this = _super.call(this) || this;
        //if (!m || m.length <= 0) throw new Error("无法构造无内容的多项式");
        _this.monomials = m;
        return _this;
    }
    Polynomial.prototype.length = function () { return this.monomials.length; };
    Polynomial.Create = function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i] = arguments[_i];
        }
        if (!m || m.length <= 0)
            throw new Error("无法构造无内容的多项式");
        if (m.length == 1)
            return m[0];
        return new Polynomial(m);
    };
    // static Create(m:Monomial[]):Monomial|Polynomial{return }
    Polynomial.prototype.Opp = function () {
        var nm = this.monomials;
        if (nm) {
            for (var i; i < nm.length; i++)
                nm[i] = nm[i].Rec();
        }
        return new Polynomial(nm);
    };
    Polynomial.prototype.Rec = function () {
        if (this.monomials && this.monomials.length == 1)
            return this.monomials[0].Rec();
        throw new Error("暂不支持取多项式倒数");
    };
    return Polynomial;
}(RealComputable));
function GreatestCommonDivisor(a, b) {
    var c = a % b;
    if (c == 0) {
        return b;
    }
    return arguments.callee(b, c);
}
var ReachMaxWarning;
function CheckNumber(n) {
    if (!isNaN(n) && Math.abs(n) > advisedMaxNumber && ReachMaxWarning && ReachMaxWarning.length == 1)
        ReachMaxWarning(n);
}
