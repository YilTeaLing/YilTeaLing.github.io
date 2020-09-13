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
Copyright © 2020 All rights reserved.
Author: LonelyDagger, Passthem, Tealing
DONOT DISTRIBUTE! VIOLATORS WILL BE DEALT WITH ACCORDING TO LAW.
 */ /*
总进度:正改善算法。使用valueOf()和toString()方法得到对象的最简表示方式。
具体进度:已实现所有类的valueOf()和toString()方法。已改善equals()算法。
位置: Unknown
*/ function copyObject(origin) { return Object.create(origin).__proto__; }
//实现实数范围内的跨类型计算。
//建立一个此类的公共实例即可调用实例方法计算。
//不使用静态方法以提供对计算方法的拓展。
//优先级:RealComputable(简称Real,不推荐使用此基类运算),Rational,Irrational(SpecialConst,SpecialConstItem,SquareRoot,IrrationalItem),ConstItem,Uncertain,UncertainItem,Monomial,Polynomial
var RealComputer = /** @class */ (function () {
    function RealComputer() {
    }
    //#region 有理数加法
    RealComputer.prototype.rationalAddrational = function (a, b) {
        return new Rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
    };
    RealComputer.prototype.rationalAddconstItem = function (a, b) {
        if (!b.hasIrrational())
            return this.rationalAddrational(a, b.rational);
        else
            return Polynomial.create(Monomial.create(a), Monomial.create(b));
    };
    RealComputer.prototype.rationalAddmonomial = function (a, b) {
        //若b不含无理数和未知数，将有理数部分相加
        if (!b.hasIrrational() && !b.hasUncertain())
            return this.rationalAddrational(a, b["const"].rational);
        //否则创建多项式
        else
            return Polynomial.create(Monomial.create(a), b);
    };
    RealComputer.prototype.rationalAddpolynomial = function (a, b) {
        var tp = copyObject(b);
        for (var i = 0; i < tp.length(); i++)
            //若b中某一项不含无理数和未知数，将有理数部分相加
            if (!tp.monomials[i].hasIrrational() && !tp.monomials[i].hasUncertain()) {
                tp.monomials[i] = Monomial.create(this.rationalAddrational(a, tp.monomials[i]["const"].rational));
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = Monomial.create(a);
        return tp;
    };
    //#endregion
    //#region 无理数加法
    RealComputer.prototype.irrationalAddirrational = function (a, b) {
        if (RealComputable.equals(a, b))
            return new ConstItem(new Rational(2, 1, true), IrrationalItem.create(a));
        return Polynomial.create(Monomial.create(a), Monomial.create(b));
    };
    RealComputer.prototype.irrationalAddconstItem = function (a, b) {
        if (b.hasIrrational() && RealComputable.equals(a, b.irrational))
            return new ConstItem(this.rationalAddrational(Rational.One, b.rational), IrrationalItem.create(a));
        else
            return Polynomial.create(Monomial.create(a), Monomial.create(b));
    };
    RealComputer.prototype.irrationalAddmonomial = function (a, b) {
        //若b中无理数等于a且不含未知数，将有理数部分+1
        if (RealComputable.equals(a, b["const"].irrational) && !b.hasUncertain())
            return new ConstItem(this.rationalAddrational(Rational.One, b["const"].rational), IrrationalItem.create(a));
        //否则创建多项式
        else
            return Polynomial.create(Monomial.create(a), b);
    };
    RealComputer.prototype.irrationalAddpolynomial = function (a, b) {
        var tp = copyObject(b);
        for (var i = 0; i < tp.length(); i++)
            //若b中某一项无理数等于a且不含未知数，将有理数部分+1
            if (tp.monomials[i]["const"].irrational.equals(a) && !tp.monomials[i].hasUncertain()) {
                tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(Rational.One, tp.monomials[i]["const"].rational), IrrationalItem.create(a));
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = Monomial.create(a);
        return tp;
    };
    //#endregion
    //#region 常数项加法
    RealComputer.prototype.constItemAddreal = function (a, b) {
        if (a.hasIrrational()) {
            if (b instanceof Rational || b instanceof Uncertain || b instanceof UncertainItem)
                return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a，b均为无理数，判断无理数是否相等，相等返回2a，否则创建多项式
            if (b instanceof Irrational)
                return this.irrationalAddirrational(a, b);
            if (b instanceof ConstItem)
                if (b.hasIrrational() && RealComputable.equals(a, b.irrational))
                    return new ConstItem(this.rationalAddrational(a.rational, b.rational), IrrationalItem.create(a.irrational));
                else
                    return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a无理数，b单项式
            if (b instanceof Monomial)
                //若b中无理数等于a且不含未知数，将有理数部分+1
                if (RealComputable.equals(a.irrational, b["const"].irrational) && !b.hasUncertain())
                    return Monomial.createComplete(this.rationalAddrational(a.rational, b["const"].rational), a.irrational);
                //否则创建多项式
                else
                    return Polynomial.create(Monomial.create(a), b);
            //a无理数，b多项式
            if (b instanceof Polynomial) {
                var tp = copyObject(b);
                for (var i = 0; i < tp.length(); i++)
                    //若b中某一项无理数等于a且不含未知数，将有理数部分+1
                    if (tp.monomials[i]["const"].irrational.equals(a.irrational) && !tp.monomials[i].hasUncertain()) {
                        tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(a.rational, tp.monomials[i]["const"].rational), a.irrational);
                        return tp;
                    }
                //否则在多项式中添加一项
                tp.monomials[i] = Monomial.create(a);
                return tp;
            }
        }
        else
            return RealComputable.addReal(a.rational, b);
    };
    //#endregion
    //#region 未知数加法
    RealComputer.prototype.uncertainAdduncertain = function (a, b) {
        if (RealComputable.equals(a, b))
            return Monomial.createComplete(new Rational(2, 1, true), undefined, UncertainItem.create(a));
        return Polynomial.create(Monomial.create(a), Monomial.create(b));
    };
    RealComputer.prototype.uncertainAdduncertainItem = function (a, b) {
        if (b.length() == 1)
            return this.uncertainAdduncertain(a, b.uncertains[0]);
        else
            return Polynomial.create(Monomial.create(a), Monomial.create(b));
    };
    RealComputer.prototype.uncertainAddmonomial = function (a, b) {
        if (!b.hasIrrational && b.hasUncertain() && b.uncertains.uncertains.length == 1 && RealComputable.equals(a, b.uncertains.uncertains[0]))
            return Monomial.createComplete(this.rationalAddrational(Rational.One, b["const"].rational), undefined, UncertainItem.create(a));
        else
            return Polynomial.create(Monomial.create(a), b);
    };
    RealComputer.prototype.uncertainAddpolynomial = function (a, b) {
        var tp = copyObject(b);
        for (var i = 0; i < tp.length(); i++)
            //若b中某一项不含无理数且未知数符号和指数等于a，将有理数部分+1
            if (!tp.monomials[i].hasIrrational() && tp.monomials[i].hasUncertain() && tp.monomials[i].uncertains.uncertains.length == 1 && RealComputable.equals(a, tp.monomials[i].uncertains.uncertains[0])) {
                tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(Rational.One, tp.monomials[i]["const"].rational), undefined, UncertainItem.create(a));
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = Monomial.create(a);
        return tp;
    };
    //#endregion
    //#region 未知数项加法
    RealComputer.prototype.uncertainItemAddreal = function (a, b) {
        if (a.uncertains.length == 1)
            return RealComputable.addReal(a.uncertains[0], b);
        if (b instanceof Rational || b instanceof Irrational || b instanceof ConstItem || b instanceof UncertainItem)
            return Polynomial.create(Monomial.create(a), Monomial.create(b));
        if (b instanceof UncertainItem)
            if (RealComputable.equals(a, b))
                return Monomial.createComplete(new Rational(2, 1, true), undefined, a);
            else
                return Polynomial.create(Monomial.create(a), Monomial.create(b));
        if (b instanceof Monomial)
            if (!b.hasIrrational() && b.hasUncertain() && RealComputable.equals(a, b.uncertains))
                return Monomial.createComplete(this.rationalAddrational(Rational.One, b["const"].rational), undefined, a);
        if (b instanceof Polynomial) {
            var tp = copyObject(b);
            for (var i = 0; i < tp.monomials.length; i++)
                if (!tp.monomials[i].hasIrrational() && tp.monomials[i].hasUncertain() && RealComputable.equals(a, tp.monomials[i].uncertains)) {
                    tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(Rational.One, tp.monomials[i]["const"].rational), undefined, a);
                    return tp;
                }
            tp.monomials[i] = Monomial.create(a);
            return tp;
        }
    };
    //#endregion
    //#region 单项式加法
    RealComputer.prototype.monomialAddmonomial = function (a, b) {
        //a，b无理数部分相同或不含无理数
        if ((a.hasIrrational() && b.hasIrrational() && a["const"].irrational.equals(b["const"].irrational)) || (!a.hasIrrational() && !b.hasIrrational()))
            //若a，b均含未知数且完全相同，或a，b均不含未知数，则将有理数部分相加
            if (RealComputable.equals(a.uncertains, b.uncertains))
                return Monomial.createComplete(this.rationalAddrational(a["const"].rational, b["const"].rational), a.hasIrrational() ? a["const"].irrational : undefined, a.uncertains);
        //否则连接a，b创建多项式
        return Polynomial.create(a, b);
    };
    RealComputer.prototype.monomialAddpolynomial = function (a, b) {
        var tp = copyObject(b);
        for (var i = 0; i < tp.length(); i++)
            //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
            if (((a.hasIrrational() && tp.monomials[i].hasIrrational() && RealComputable.equals(a["const"].irrational, tp.monomials[i]["const"].irrational)) || (!a.hasIrrational() && !tp.monomials[i].hasIrrational())) && (RealComputable.equals(a.uncertains, tp.monomials[i].uncertains))) {
                tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(a["const"].rational, tp.monomials[i]["const"].rational), a.hasIrrational() ? a["const"].irrational : undefined, a.uncertains);
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = a;
        return tp;
    };
    //#endregion
    //#region 多项式加法
    RealComputer.prototype.polynomialAddpolynomial = function (a, b) {
        var tp = copyObject(a);
        for (var i = 0; i < b.monomials.length; i++)
            tp = this.monomialAddpolynomial(b.monomials[i], tp);
        return tp;
    };
    //#endregion
    //#region 有理数乘法
    RealComputer.prototype.rationalMulrational = function (a, b) {
        return new Rational(a.self * b.self, a.divisor * b.divisor);
    };
    RealComputer.prototype.rationalMulirrational = function (a, b) {
        return new ConstItem(a, IrrationalItem.create(b));
    };
    RealComputer.prototype.rationalMulconstItem = function (a, b) {
        return new ConstItem(b.hasRational() ? this.rationalMulrational(a, b.rational) : a, b.irrational);
    };
    RealComputer.prototype.rationalMuluncertain = function (a, b) {
        return Monomial.createComplete(a, undefined, UncertainItem.create(b));
    };
    RealComputer.prototype.rationalMuluncertainItem = function (a, b) {
        return Monomial.createComplete(a, undefined, b);
    };
    RealComputer.prototype.rationalMulmonomial = function (a, b) {
        return Monomial.createComplete(b.hasRational() ? this.rationalMulrational(a, b["const"].rational) : a, b["const"].irrational, b.uncertains);
    };
    RealComputer.prototype.rationalMulpolymomial = function (a, b) {
        var tp = copyObject(b);
        for (var i = 0; i < tp.monomials.length; i++)
            tp.monomials[i] = this.rationalMulmonomial(a, tp.monomials[i]);
        return tp;
    };
    //#endregion
    //#region 无理数乘法
    RealComputer.prototype.irrationalMulirrational = function (a, b) {
        if (a instanceof SpecialConst) {
            if (b instanceof SpecialConst)
                if (a.type == b.type) {
                    var te = a.exponent + b.exponent;
                    if (te == 0)
                        return Rational.One;
                    else
                        return new SpecialConst(a.type, te, true);
                }
                else
                    return IrrationalItem.create(a, b);
            if (b instanceof SpecialConstItem) {
                var tc = copyObject(b.consts);
                var te = void 0;
                for (var i; i <= tc.length; i++)
                    if (a.type == tc[i].type) {
                        te = a.exponent + tc[i].exponent;
                        if (te == 0) {
                            if (tc.length == 1)
                                return Rational.Zero;
                            tc.splice(i, 1);
                            return new SpecialConstItem(tc);
                        }
                        else {
                            tc[i] = new SpecialConst(a.type, te);
                            return new SpecialConstItem(tc);
                        }
                    }
                tc[i] = a;
                return new SpecialConstItem(tc);
            }
            if (b instanceof SquareRoot)
                return IrrationalItem.create(a, b);
            if (b instanceof IrrationalItem)
                return RealComputable.mulReal(this.irrationalMulirrational(a, b.consts), b.squareRoot);
        }
        if (a instanceof SpecialConstItem) {
            if (b instanceof SpecialConst)
                return this.irrationalMulirrational(b, a);
            if (b instanceof SpecialConstItem) {
                //尚待完善
            }
        }
    };
    return RealComputer;
}());
var RealComputable = /** @class */ (function () {
    function RealComputable() {
    }
    RealComputable.addReal = function (a, b) {
        if (a == undefined && b == undefined)
            throw new Error("不能对两个空对象进行加运算");
        if (a == undefined)
            return b;
        if (b == undefined)
            return a;
        if (a instanceof Rational) {
            //a有理数，b无理数/未知数，创建多项式
            if (b instanceof Irrational || b instanceof Uncertain || b instanceof UncertainItem)
                return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a，b均为有理数，分数通分加减法(Rational构造函数负责化简)
            if (b instanceof Rational)
                return this.com.rationalAddrational(a, b);
            if (b instanceof ConstItem)
                return this.com.rationalAddconstItem(a, b);
            //a有理数，b单项式
            if (b instanceof Monomial)
                return this.com.rationalAddmonomial(a, b);
            //a有理数，b多项式
            if (b instanceof Polynomial)
                return this.com.rationalAddpolynomial(a, b);
        }
        if (a instanceof Irrational) {
            if (b instanceof Rational || b instanceof Uncertain || b instanceof UncertainItem)
                return Polynomial.create(Monomial.create(a), Monomial.create(b));
            if (b instanceof Irrational)
                return this.com.irrationalAddirrational(a, b);
            if (b instanceof ConstItem)
                return this.com.irrationalAddconstItem(a, b);
            //a无理数，b单项式
            if (b instanceof Monomial)
                return this.com.irrationalAddmonomial(a, b);
            //a无理数，b多项式
            if (b instanceof Polynomial)
                return this.com.irrationalAddpolynomial(a, b);
        }
        if (a instanceof ConstItem) {
            return this.com.constItemAddreal(a, b);
        }
        if (a instanceof Uncertain) {
            if (b instanceof Rational || b instanceof Irrational || b instanceof ConstItem)
                return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a，b均为未知数，如果符号和指数相同，返回2a，否则创建多项式
            if (b instanceof Uncertain)
                return this.com.uncertainAdduncertain(a, b);
            if (b instanceof UncertainItem)
                return this.com.uncertainAdduncertainItem(a, b);
            //a未知数，b单项式，若b不含无理数且未知数符号和指数等于a，将有理数部分+1，否则创建多项式
            if (b instanceof Monomial)
                return this.com.uncertainAddmonomial(a, b);
            //a未知数，b多项式
            if (b instanceof Polynomial)
                return this.com.uncertainAddpolynomial(a, b);
        }
        if (a instanceof UncertainItem) {
            return this.com.uncertainItemAddreal(a, b);
        }
        if (a instanceof Monomial) {
            if (b instanceof Rational)
                return this.com.rationalAddmonomial(b, a);
            if (b instanceof Irrational)
                return this.com.irrationalAddmonomial(b, a);
            if (b instanceof Uncertain)
                return this.com.uncertainAddmonomial(b, a);
            if (b instanceof UncertainItem)
                return this.com.uncertainItemAddreal(b, a);
            if (b instanceof Monomial)
                return this.com.monomialAddmonomial(a, b);
            if (b instanceof Polynomial)
                return this.com.monomialAddpolynomial(a, b);
        }
        if (a instanceof Polynomial) {
            //a为多项式，b为，复用方法
            if (b instanceof Rational)
                return this.com.rationalAddpolynomial(b, a);
            if (b instanceof Irrational)
                return this.com.irrationalAddpolynomial(b, a);
            if (b instanceof ConstItem)
                return this.com.constItemAddreal(b, a);
            if (b instanceof Uncertain)
                return this.com.uncertainAddpolynomial(b, a);
            if (b instanceof UncertainItem)
                return this.com.uncertainItemAddreal(b, a);
            if (b instanceof Monomial)
                return this.com.monomialAddpolynomial(b, a);
            if (b instanceof Polynomial)
                return this.com.polynomialAddpolynomial(a, b);
        }
        throw new Error("未定义的运算:add(" + a + "," + b + ")");
    };
    //此方法停留在较老的版本。将移植所有计算逻辑至RealComputer中。
    RealComputable.mulReal = function (a, b) {
        throw new Error("T");
        /*{
          if (a == undefined && b == undefined)
              throw new Error("不能对两个空对象进行乘运算");
          if (a == undefined)
              return b;
          if (b == undefined)
              return a;
          if (a instanceof Rational) {
              //a=0，不运算
              if (a.equals(Rational.Zero)) return a;
              if (a.equals(Rational.One)) return b;
              if (a.equals(Rational.MinusOne)) return b.opp();
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
                      if (!b.monomials[i].hasIrrational() && !b.monomials[i].hasUncertain())
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
                  if (b.hasUncertain())
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
                  if (a.hasUncertain()) {
                      if (b.hasUncertain()) u = realComputable.mulReal(a.uncertains, b.uncertains);
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
          }
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
      }*/ 
    };
    RealComputable.equals = function (a, b) {
        return a.toString() == b.toString();
        /*if (a == b)
            return true;
        if (a instanceof Rational) {
            if (b instanceof Rational)
                return a.self == b.self && a.divisor == b.divisor;
            if (b instanceof ConstItem)
                return !b.hasIrrational() && RealComputable.equals(a, b.rational);
            if (b instanceof Monomial)
                return !b.hasIrrational() && !b.hasUncertain() && RealComputable.equals(a, b.const.rational);
        }
        if (a instanceof Irrational) {
            if (b instanceof Irrational)
                return Irrational.irrationalEquals(a, b);
            if (b instanceof ConstItem)
                return !b.hasRational() && RealComputable.equals(a, b.irrational);
            if (b instanceof Monomial)
                return !b.hasRational() && !b.hasUncertain() && RealComputable.equals(a, b.const.irrational);
        }
        if (a instanceof ConstItem) {
            if (b instanceof Rational)
                return !a.hasIrrational() && RealComputable.equals(a.rational, b);
            if (b instanceof Irrational)
                return !a.hasRational() && RealComputable.equals(a.irrational, b);
            if (b instanceof ConstItem)
                return ((a.hasRational() && b.hasRational() && RealComputable.equals(a.rational, b.rational)) || (!a.hasRational() && !b.hasRational())) && ((a.hasIrrational() && b.hasIrrational() && RealComputable.equals(a.irrational, b.irrational)) || (!a.hasIrrational() && !b.hasIrrational()));
            if (b instanceof Monomial)
                return !b.hasUncertain() && RealComputable.equals(a, b.const);
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
                    for (let i: number = 0; i < a.length(); i++)
                        if (!RealComputable.equals(a.monomials[i], b.monomials[i]))
                            return false;
                    return true;
                }
            }
        return false;*/
    };
    RealComputable.prototype.add = function (n) { return RealComputable.addReal(this, n); };
    RealComputable.prototype.min = function (n) { return this.add(n.opp()); };
    RealComputable.prototype.mul = function (n) { {
        return RealComputable.mulReal(this, n);
    } };
    RealComputable.prototype.div = function (n) { return this.mul(n.rec()); };
    RealComputable.prototype.equals = function (n) { return RealComputable.equals(this, n); };
    RealComputable.com = new RealComputer();
    return RealComputable;
}());
var Uncertain = /** @class */ (function (_super) {
    __extends(Uncertain, _super);
    function Uncertain(s, e, v) {
        if (e === void 0) { e = 1; }
        if (v === void 0) { v = false; }
        var _this = _super.call(this) || this;
        _this.symbol = s;
        if (v)
            _this.exponent = e;
        else {
            if (!s || s.length != 1)
                throw new Error("未知数的命名无效: 长度不能为" + (s ? s.length : "0"));
            if (!(s >= "a" && s <= "z"))
                throw new Error("未知数的命名无效: 无效的字符: " + s);
            if (e == 0)
                throw new Error("将不会对未知数进行零次幂运算。请尝试改用\"1\"");
            checkInt(e);
            _this.exponent = e;
        }
        return _this;
    }
    Uncertain.prototype.valueOf = function () { return this; };
    Uncertain.prototype.toString = function () { return this.exponent == 1 ? this.symbol : (this.symbol + "^" + this.exponent); };
    Uncertain.prototype.opp = function () { return Monomial.createComplete(Rational.MinusOne, undefined, new UncertainItem([this])); };
    Uncertain.prototype.rec = function () { return new Uncertain(this.symbol, -this.exponent, true); };
    return Uncertain;
}(RealComputable));
function checkInt(o) {
    var i = o.toString().indexOf('.');
    if (i >= 0)
        throw new Error("无效的小数");
}
var Rational = /** @class */ (function (_super) {
    __extends(Rational, _super);
    function Rational(s, d, v) {
        if (v === void 0) { v = false; }
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
    Rational.prototype.valueOf = function () { return this.divisor == 1 ? this.self : this; };
    Rational.prototype.toString = function () { return this.divisor == 1 ? this.self.toString() : (this.self + "/" + this.divisor); };
    Rational.prototype.opp = function () { return new Rational(-this.self, this.divisor); };
    Rational.prototype.rec = function () { return new Rational(this.divisor, this.self); };
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
    Irrational.irrationalEquals = function (a, b) {
        if (a == b)
            return true;
        if (a instanceof SpecialConst) {
            if (b instanceof SpecialConst)
                return a.type == b.type && a.exponent == b.exponent;
            if (b instanceof SpecialConstItem)
                return b.consts.length == 1 && this.irrationalEquals(a, b.consts[0]);
            if (b instanceof IrrationalItem)
                return !b.hasSquareRoot() && b.consts && b.consts.length() == 1 && this.irrationalEquals(a, b.consts[0]);
        }
        if (a instanceof SpecialConstItem) {
            if (b instanceof SpecialConst)
                return this.irrationalEquals(b, a);
            if (b instanceof SpecialConstItem) {
                if (a.consts.length == b.consts.length) {
                    for (var i = 0; i < a.consts.length; i++)
                        if (!this.irrationalEquals(a.consts[i], b.consts[i]))
                            return false;
                    return true;
                }
            }
            if (b instanceof IrrationalItem)
                return !b.hasSquareRoot() && this.irrationalEquals(a, b.consts);
        }
        if (a instanceof SquareRoot) {
            if (b instanceof SquareRoot)
                return a.self == b.self;
            if (b instanceof IrrationalItem)
                return !b.hasConsts() && b.squareRoot && a.self == b.squareRoot.self;
        }
        if (a instanceof IrrationalItem) {
            if (a.hasConsts()) {
                if (a.hasSquareRoot())
                    return b instanceof IrrationalItem && b.hasConsts() && b.hasSquareRoot() && this.irrationalEquals(a.consts, b.consts) && this.irrationalEquals(a.squareRoot, b.squareRoot);
                return this.irrationalEquals(a.consts, b);
            }
            return this.irrationalEquals(a.squareRoot, b);
        }
        return false;
    };
    Irrational.prototype.opp = function () { return new ConstItem(Rational.MinusOne, IrrationalItem.create(this)); };
    return Irrational;
}(RealComputable));
var SpecialConst = /** @class */ (function (_super) {
    __extends(SpecialConst, _super);
    function SpecialConst(t, e, v) {
        if (e === void 0) { e = 1; }
        if (v === void 0) { v = false; }
        var _this = _super.call(this) || this;
        if (v)
            _this.exponent = e;
        else {
            if (e == 0)
                throw new Error("将不会对特殊常量进行零次幂运算。请尝试改用\"1\"");
            checkInt(e);
            _this.exponent = e;
        }
        _this.type = t;
        return _this;
    }
    SpecialConst.prototype.valueOf = function () { return this; };
    SpecialConst.prototype.toString = function () { return this.exponent == 1 ? this.type : (this.type + "^" + this.exponent); };
    SpecialConst.prototype.rec = function () { return new SpecialConst(this.type, -this.exponent, true); };
    return SpecialConst;
}(Irrational));
var ConstType;
(function (ConstType) {
    ConstType["Pi"] = "Pi";
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
var SquareRoot = /** @class */ (function (_super) {
    __extends(SquareRoot, _super);
    function SquareRoot(s) {
        var _this = _super.call(this) || this;
        _this.self = s;
        return _this;
    }
    SquareRoot.prototype.valueOf = function () { return this; };
    SquareRoot.prototype.toString = function () { return "√(" + this.self + ")"; };
    SquareRoot.unsafeCreate = function (s) { return new SquareRoot(s); };
    SquareRoot.create = function (s) {
        if (s < 0)
            throw new Error("负数没有实数平方根");
        if (s == 0)
            return Rational.Zero;
        if (s == 1)
            return Rational.One;
        checkInt(s);
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
        return new ConstItem(new Rational(r, 1), IrrationalItem.create(new SquareRoot(s)));
    };
    SquareRoot.prototype.rec = function () { return new ConstItem(new Rational(1, this.self), IrrationalItem.create(this)); };
    return SquareRoot;
}(Irrational));
var ConstItem = /** @class */ (function (_super) {
    __extends(ConstItem, _super);
    function ConstItem(r, i) {
        if (r === void 0) { r = Rational.One; }
        var _this = _super.call(this) || this;
        _this.rational = r;
        _this.irrational = i;
        return _this;
    }
    ConstItem.prototype.valueOf = function () { return this.hasRational() ? (this.hasIrrational() ? this : this.rational.valueOf()) : (this.hasIrrational() ? this.irrational.valueOf() : 1); };
    ConstItem.prototype.toString = function () { return this.hasRational() ? (this.hasIrrational() ? (this.rational.toString() + "*" + this.irrational.toString()) : this.rational.toString()) : (this.hasIrrational() ? this.irrational.toString() : "1"); };
    ConstItem.prototype.hasRational = function () { return !this.rational.equals(Rational.One); };
    ConstItem.prototype.hasIrrational = function () { return this.irrational != undefined; };
    ConstItem.prototype.opp = function () { return new ConstItem(this.rational.opp(), this.irrational); };
    ConstItem.prototype.rec = function () {
        var tr = this.hasRational() ? this.rational.rec() : Rational.One;
        if (this.hasIrrational())
            return RealComputable.mulReal(tr, this.irrational.rec());
        return tr;
    };
    return ConstItem;
}(RealComputable));
var SpecialConstItem = /** @class */ (function (_super) {
    __extends(SpecialConstItem, _super);
    function SpecialConstItem(c) {
        var _this = _super.call(this) || this;
        if (c && c.length > 0)
            _this.consts = c;
        else
            throw new Error("无法构造无内容的特殊常数项");
        return _this;
    }
    SpecialConstItem.prototype.valueOf = function () { return this.consts.length == 1 ? this.consts[0] : this.consts; };
    SpecialConstItem.prototype.toString = function () { return this.consts.join(""); };
    SpecialConstItem.create = function () {
        var c = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            c[_i] = arguments[_i];
        }
        return new SpecialConstItem(c);
    };
    SpecialConstItem.prototype.rec = function () {
        var ts = new SpecialConst[this.consts.length];
        for (var i = 0; i < ts.length; i++)
            ts[i] = new SpecialConst(this.consts[i].type, -this.consts[i].exponent);
        return new SpecialConstItem(ts);
    };
    SpecialConstItem.prototype.length = function () { return this.consts.length; };
    return SpecialConstItem;
}(Irrational));
var IrrationalItem = /** @class */ (function (_super) {
    __extends(IrrationalItem, _super);
    function IrrationalItem(i) {
        var _this = _super.call(this) || this;
        if (i.length <= 0)
            throw new Error("无法构造无内容的无理数项");
        var ts;
        for (var a = 0; a < i.length; a++)
            if (i[a] instanceof SpecialConst)
                ts[ts.length] = copyObject(i[a]);
            else if (i[a] instanceof SquareRoot)
                _this.squareRoot = i[a];
            else
                throw new Error("此无理数尚未定义: " + i[a]);
        if (ts && ts.length > 0)
            _this.consts = new SpecialConstItem(ts);
        return _this;
    }
    IrrationalItem.prototype.valueOf = function () { return this.hasConsts() ? (this.hasSquareRoot() ? this : this.consts.valueOf()) : (this.hasSquareRoot() ? this.squareRoot : 1); };
    IrrationalItem.prototype.toString = function () { return this.hasConsts() ? (this.hasSquareRoot() ? (this.consts.toString() + this.squareRoot.toString()) : this.consts.toString()) : (this.hasSquareRoot() ? this.squareRoot.toString() : "1"); };
    IrrationalItem.prototype.hasSquareRoot = function () { return this.squareRoot != undefined; };
    IrrationalItem.prototype.hasConsts = function () { return this.consts != undefined; };
    IrrationalItem.create = function () {
        var i = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            i[_i] = arguments[_i];
        }
        return this.createByArray(i);
    };
    IrrationalItem.createByArray = function (i) {
        if (i.length == 1 && i[0] instanceof IrrationalItem)
            return i[0];
        return new IrrationalItem(i);
    };
    IrrationalItem.prototype.opp = function () { return new ConstItem(Rational.MinusOne, this); };
    IrrationalItem.prototype.rec = function () { var _a; return RealComputable.mulReal((_a = this.consts) === null || _a === void 0 ? void 0 : _a.rec(), this.squareRoot); };
    return IrrationalItem;
}(Irrational));
var UncertainItem = /** @class */ (function (_super) {
    __extends(UncertainItem, _super);
    function UncertainItem(u) {
        var _this = _super.call(this) || this;
        if (!u || u.length <= 0)
            throw new Error("无法构造无内容的未知数项");
        _this.uncertains = u;
        return _this;
    }
    UncertainItem.prototype.valueOf = function () { return this.uncertains.length == 1 ? this.uncertains[0] : this.uncertains; };
    UncertainItem.prototype.toString = function () { return this.uncertains.join(""); };
    UncertainItem.prototype.length = function () { return this.uncertains.length; };
    UncertainItem.create = function () {
        var u = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            u[_i] = arguments[_i];
        }
        return new UncertainItem(u);
    };
    UncertainItem.prototype.opp = function () { return Monomial.createComplete(Rational.MinusOne, undefined, this); };
    UncertainItem.prototype.rec = function () {
        var tu = copyObject(this.uncertains);
        for (var i = 0; i < tu.length; i++)
            tu[i] = new Uncertain(tu[i].symbol, -tu[i].exponent);
        return new UncertainItem(tu);
    };
    return UncertainItem;
}(RealComputable));
var Monomial = /** @class */ (function (_super) {
    __extends(Monomial, _super);
    function Monomial(c, u) {
        var _this = _super.call(this) || this;
        _this["const"] = c ? c : new ConstItem(Rational.One, undefined);
        if (u && u.length() > 0)
            _this.uncertains = u;
        return _this;
    }
    Monomial.prototype.valueOf = function () { return this.hasUncertain() ? this : this["const"].valueOf(); };
    Monomial.prototype.toString = function () { return this.hasUncertain() ? this["const"].toString() + this.uncertains.toString() : this["const"].toString(); };
    Monomial.prototype.hasRational = function () { return this["const"].hasRational(); };
    Monomial.prototype.hasIrrational = function () { return this["const"].hasIrrational(); };
    Monomial.prototype.hasUncertain = function () { return this.uncertains != undefined; };
    Monomial.createComplete = function (r, i, u) {
        if (r === void 0) { r = Rational.One; }
        return new Monomial(new ConstItem(r, i), u);
    };
    Monomial.create = function (i) {
        if (i instanceof Rational)
            return new Monomial(new ConstItem(i), undefined);
        if (i instanceof SpecialConst || i instanceof SquareRoot)
            return new Monomial(new ConstItem(undefined, IrrationalItem.create(i)), undefined);
        if (i instanceof SpecialConstItem)
            return new Monomial(new ConstItem(undefined, IrrationalItem.createByArray(i.consts)), undefined);
        if (i instanceof IrrationalItem)
            return new Monomial(new ConstItem(undefined, i), undefined);
        if (i instanceof ConstItem)
            return new Monomial(i, undefined);
        if (i instanceof Uncertain)
            return new Monomial(undefined, new UncertainItem([i]));
        if (i instanceof UncertainItem)
            return new Monomial(undefined, i);
        throw new Error("此对象无法用于构造单项式: " + i);
    };
    Monomial.prototype.opp = function () { return new Monomial(this["const"].opp(), this.uncertains); };
    Monomial.prototype.rec = function () { return RealComputable.mulReal(this["const"].rec(), this.uncertains.rec()); };
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
    Polynomial.prototype.valueOf = function () { return this.monomials.length == 1 ? this.monomials[0] : this.monomials; };
    Polynomial.prototype.toString = function () { return this.monomials.join("+"); };
    Polynomial.prototype.length = function () { return this.monomials.length; };
    Polynomial.create = function () {
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
    Polynomial.prototype.opp = function () {
        var tm = copyObject(this.monomials);
        for (var i = void 0; i < tm.length; i++)
            tm[i] = tm[i].opp();
        return new Polynomial(tm);
    };
    Polynomial.prototype.rec = function () {
        if (this.monomials && this.monomials.length == 1)
            return this.monomials[0].rec();
        throw new Error("暂不支持取多项式倒数");
    };
    return Polynomial;
}(RealComputable));
function greatestCommonDivisor(a, b) {
    var c = a % b;
    if (c == 0)
        return b;
    return arguments.callee(b, c);
}
