/*
Copyright © 2020 All rights reserved.
Author: LonelyDagger, Passthem, Tealing
DONOT DISTRIBUTE! VIOLATORS WILL BE DEALT WITH ACCORDING TO LAW.
 *//*
总进度:正将乘法迁移至RealComputer方法中。
具体进度:加法完全实现/乘法已实现有理数运算，无理数与无理数运算尚待实现。
位置: Line 260
*/function copyObject<T extends object>(origin: T): T { return Object.create(origin).__proto__; }
//实现实数范围内的跨类型计算。
//建立一个此类的公共实例即可调用实例方法计算。
//不使用静态方法以提供对计算方法的拓展。
//优先级:RealComputable(简称Real,不推荐使用此基类运算),Rational,Irrational(SpecialConst,SpecialConstItem,SquareRoot,IrrationalItem),ConstItem,Uncertain,UncertainItem,Monomial,Polynomial
class RealComputer {
    //#region 有理数加法
    public rationalAddrational(a: Rational, b: Rational): Rational {
        return new Rational(a.self * b.divisor + b.self * a.divisor, a.divisor * b.divisor);
    }
    public rationalAddconstItem(a: Rational, b: ConstItem): Rational | Polynomial {
        if (!b.hasIrrational())
            return this.rationalAddrational(a, b.rational);
        else return <Polynomial>Polynomial.create(Monomial.create(a), Monomial.create(b));
    }
    public rationalAddmonomial(a: Rational, b: Monomial): Rational | Polynomial {
        //若b不含无理数和未知数，将有理数部分相加
        if (!b.hasIrrational() && !b.hasUncertain())
            return this.rationalAddrational(a, b.const.rational);
        //否则创建多项式
        else return <Polynomial>Polynomial.create(Monomial.create(a), b);
    }
    public rationalAddpolynomial(a: Rational, b: Polynomial): Polynomial {
        let tp: Polynomial = copyObject(b);
        for (var i: number = 0; i < tp.length(); i++)
            //若b中某一项不含无理数和未知数，将有理数部分相加
            if (!tp.monomials[i].hasIrrational() && !tp.monomials[i].hasUncertain()) {
                tp.monomials[i] = Monomial.create(this.rationalAddrational(a, tp.monomials[i].const.rational));
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = Monomial.create(a);
        return tp;
    }
    //#endregion
    //#region 无理数加法
    public irrationalAddirrational(a: Irrational, b: Irrational): ConstItem | Polynomial {
        if (RealComputable.equals(a, b))
            return new ConstItem(new Rational(2, 1, true), IrrationalItem.create(a));
        return <Polynomial>Polynomial.create(Monomial.create(a), Monomial.create(b));
    }
    public irrationalAddconstItem(a: Irrational, b: ConstItem): ConstItem | Polynomial {
        if (b.hasIrrational() && RealComputable.equals(a, b.irrational))
            return new ConstItem(this.rationalAddrational(Rational.One, b.rational), IrrationalItem.create(a));
        else return <Polynomial>Polynomial.create(Monomial.create(a), Monomial.create(b));
    }
    public irrationalAddmonomial(a: Irrational, b: Monomial): ConstItem | Polynomial {
        //若b中无理数等于a且不含未知数，将有理数部分+1
        if (RealComputable.equals(a, b.const.irrational) && !b.hasUncertain())
            return new ConstItem(this.rationalAddrational(Rational.One, b.const.rational), IrrationalItem.create(a));
        //否则创建多项式
        else return <Polynomial>Polynomial.create(Monomial.create(a), b);
    }
    public irrationalAddpolynomial(a: Irrational, b: Polynomial): Polynomial {
        let tp: Polynomial = copyObject(b);
        for (var i: number = 0; i < tp.length(); i++)
            //若b中某一项无理数等于a且不含未知数，将有理数部分+1
            if (tp.monomials[i].const.irrational.equals(a) && !tp.monomials[i].hasUncertain()) {
                tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(Rational.One, tp.monomials[i].const.rational), IrrationalItem.create(a));
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = Monomial.create(a);
        return tp;
    }
    //#endregion
    //#region 常数项加法
    public constItemAddreal(a: ConstItem, b: RealComputable): Rational | ConstItem | Monomial | Polynomial {
        if (a.hasIrrational()) {
            if (b instanceof Rational || b instanceof Uncertain || b instanceof UncertainItem)
                return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a，b均为无理数，判断无理数是否相等，相等返回2a，否则创建多项式
            if (b instanceof Irrational)
                return this.irrationalAddirrational(a, b);
            if (b instanceof ConstItem)
                if (b.hasIrrational() && RealComputable.equals(a, b.irrational))
                    return new ConstItem(this.rationalAddrational(a.rational, b.rational), IrrationalItem.create(a.irrational));
                else return Polynomial.create(Monomial.create(a), Monomial.create(b));
            //a无理数，b单项式
            if (b instanceof Monomial)
                //若b中无理数等于a且不含未知数，将有理数部分+1
                if (RealComputable.equals(a.irrational, b.const.irrational) && !b.hasUncertain())
                    return Monomial.createComplete(this.rationalAddrational(a.rational, b.const.rational), a.irrational);
                //否则创建多项式
                else return Polynomial.create(Monomial.create(a), b);
            //a无理数，b多项式
            if (b instanceof Polynomial) {
                let tp: Polynomial = copyObject(b);
                for (var i: number = 0; i < tp.length(); i++)
                    //若b中某一项无理数等于a且不含未知数，将有理数部分+1
                    if (tp.monomials[i].const.irrational.equals(a.irrational) && !tp.monomials[i].hasUncertain()) {
                        tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(a.rational, tp.monomials[i].const.rational), a.irrational);
                        return tp;
                    }
                //否则在多项式中添加一项
                tp.monomials[i] = Monomial.create(a);
                return tp;
            }
        } else return <Rational | Polynomial>RealComputable.addReal(a.rational, b);
    }
    //#endregion
    //#region 未知数加法
    public uncertainAdduncertain(a: Uncertain, b: Uncertain): Monomial | Polynomial {
        if (RealComputable.equals(a, b))
            return Monomial.createComplete(new Rational(2, 1, true), undefined, UncertainItem.create(a));
        return Polynomial.create(Monomial.create(a), Monomial.create(b));
    }
    public uncertainAdduncertainItem(a: Uncertain, b: UncertainItem): Monomial | Polynomial {
        if (b.length() == 1)
            return this.uncertainAdduncertain(a, b.uncertains[0]);
        else return Polynomial.create(Monomial.create(a), Monomial.create(b));
    }
    public uncertainAddmonomial(a: Uncertain, b: Monomial): Monomial | Polynomial {
        if (!b.hasIrrational && b.hasUncertain() && b.uncertains.uncertains.length == 1 && RealComputable.equals(a, b.uncertains.uncertains[0]))
            return Monomial.createComplete(this.rationalAddrational(Rational.One, b.const.rational), undefined, UncertainItem.create(a));
        else return Polynomial.create(Monomial.create(a), b);
    }
    public uncertainAddpolynomial(a: Uncertain, b: Polynomial): Polynomial {
        let tp: Polynomial = copyObject(b);
        for (var i: number = 0; i < tp.length(); i++)
            //若b中某一项不含无理数且未知数符号和指数等于a，将有理数部分+1
            if (!tp.monomials[i].hasIrrational() && tp.monomials[i].hasUncertain() && tp.monomials[i].uncertains.uncertains.length == 1 && RealComputable.equals(a, tp.monomials[i].uncertains.uncertains[0])) {
                tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(Rational.One, tp.monomials[i].const.rational), undefined, UncertainItem.create(a));
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = Monomial.create(a);
        return tp;
    }
    //#endregion
    //#region 未知数项加法
    public uncertainItemAddreal(a: UncertainItem, b: RealComputable): Monomial | Polynomial {
        if (a.uncertains.length == 1)
            return <Monomial | Polynomial>RealComputable.addReal(a.uncertains[0], b);
        if (b instanceof Rational || b instanceof Irrational || b instanceof ConstItem || b instanceof UncertainItem)
            return Polynomial.create(Monomial.create(a), Monomial.create(b));
        if (b instanceof UncertainItem)
            if (RealComputable.equals(a, b))
                return Monomial.createComplete(new Rational(2, 1, true), undefined, a);
            else return Polynomial.create(Monomial.create(a), Monomial.create(b));
        if (b instanceof Monomial)
            if (!b.hasIrrational() && b.hasUncertain() && RealComputable.equals(a, b.uncertains))
                return Monomial.createComplete(this.rationalAddrational(Rational.One, b.const.rational), undefined, a);
        if (b instanceof Polynomial) {
            let tp: Polynomial = copyObject(b);
            for (var i: number = 0; i < tp.monomials.length; i++)
                if (!tp.monomials[i].hasIrrational() && tp.monomials[i].hasUncertain() && RealComputable.equals(a, tp.monomials[i].uncertains)) {
                    tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(Rational.One, tp.monomials[i].const.rational), undefined, a);
                    return tp;
                }
            tp.monomials[i] = Monomial.create(a);
            return tp;
        }
    }
    //#endregion
    //#region 单项式加法
    public monomialAddmonomial(a: Monomial, b: Monomial) {
        //a，b无理数部分相同或不含无理数
        if ((a.hasIrrational() && b.hasIrrational() && a.const.irrational.equals(b.const.irrational)) || (!a.hasIrrational() && !b.hasIrrational()))
            //若a，b均含未知数且完全相同，或a，b均不含未知数，则将有理数部分相加
            if (RealComputable.equals(a.uncertains, b.uncertains))
                return Monomial.createComplete(this.rationalAddrational(a.const.rational, b.const.rational), a.hasIrrational() ? a.const.irrational : undefined, a.uncertains);
        //否则连接a，b创建多项式
        return Polynomial.create(a, b);
    }
    public monomialAddpolynomial(a: Monomial, b: Polynomial) {
        let tp: Polynomial = copyObject(b);
        for (var i: number = 0; i < tp.length(); i++)
            //若b中某一项与a无理数部分相同或不含无理数，将有理数部分相加
            if (((a.hasIrrational() && tp.monomials[i].hasIrrational() && RealComputable.equals(a.const.irrational, tp.monomials[i].const.irrational)) || (!a.hasIrrational() && !tp.monomials[i].hasIrrational())) && (RealComputable.equals(a.uncertains, tp.monomials[i].uncertains))) {
                tp.monomials[i] = Monomial.createComplete(this.rationalAddrational(a.const.rational, tp.monomials[i].const.rational), a.hasIrrational() ? a.const.irrational : undefined, a.uncertains);
                return tp;
            }
        //否则在多项式中添加一项
        tp.monomials[i] = a;
        return tp;
    }
    //#endregion
    //#region 多项式加法
    public polynomialAddpolynomial(a: Polynomial, b: Polynomial): Polynomial {
        var tp: Polynomial = copyObject(a);
        for (let i: number = 0; i < b.monomials.length; i++)
            tp = this.monomialAddpolynomial(b.monomials[i], tp);
        return tp;
    }
    //#endregion

    //#region 有理数乘法
    public rationalMulrational(a: Rational, b: Rational): Rational {
        return new Rational(a.self * b.self, a.divisor * b.divisor);
    }
    public rationalMulirrational(a: Rational, b: Irrational): ConstItem {
        return new ConstItem(a, IrrationalItem.create(b));
    }
    public rationalMulconstItem(a: Rational, b: ConstItem): ConstItem {
        return new ConstItem(b.hasRational() ? this.rationalMulrational(a, b.rational) : a, b.irrational);
    }
    public rationalMuluncertain(a: Rational, b: Uncertain): Monomial {
        return Monomial.createComplete(a, undefined, UncertainItem.create(b));
    }
    public rationalMuluncertainItem(a: Rational, b: UncertainItem): Monomial {
        return Monomial.createComplete(a, undefined, b);
    }
    public rationalMulmonomial(a: Rational, b: Monomial): Monomial {
        return Monomial.createComplete(b.hasRational() ? this.rationalMulrational(a, b.const.rational) : a, b.const.irrational, b.uncertains);
    }
    public rationalMulpolymomial(a: Rational, b: Polynomial): Polynomial {
        var tp: Polynomial = copyObject(b);
        for (let i: number = 0; i < tp.monomials.length; i++)
            tp.monomials[i] = this.rationalMulmonomial(a, tp.monomials[i]);
        return tp;
    }
    //#endregion
    //#region 无理数乘法
    public irrationalMulirrational(a: Irrational, b: Irrational): Rational | Irrational | ConstItem {
        if (a instanceof SpecialConst) {
            if (b instanceof SpecialConst)
                if (a.type == b.type) {
                    let te: number = a.exponent + b.exponent;
                    if (te == 0)
                        return Rational.One;
                    else return new SpecialConst(a.type, te, true);
                }
                else return IrrationalItem.create(a, b);
            if (b instanceof SpecialConstItem) {
                let tc = copyObject(b.consts);
                let te: number;
                for (var i: number; i <= tc.length; i++)
                    if (a.type == tc[i].type) {
                        te = a.exponent + tc[i].exponent;
                        if (te == 0) {
                            if (tc.length == 1) return Rational.Zero;
                            tc.splice(i, 1);
                            return new SpecialConstItem(tc);
                        } else {
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
                return <Rational | Irrational>RealComputable.mulReal(this.irrationalMulirrational(a, b.consts), b.squareRoot);
        }
        if (a instanceof SpecialConstItem) {
            if (b instanceof SpecialConst)
                return this.irrationalMulirrational(b, a);
            if (b instanceof SpecialConstItem) {
                //尚待完善
            }
        }
    }
    //#endregion
}
abstract class RealComputable {
    public static com: RealComputer = new RealComputer();
    static addReal(a: RealComputable, b: RealComputable): RealComputable {
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
    }
    //此方法停留在较老的版本。将移植所有计算逻辑至RealComputer中。
    static mulReal(a: RealComputable, b: RealComputable): RealComputable {
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
    static equals(a: RealComputable, b: RealComputable): boolean {
        if (a == b)
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
                    for (let i: number = 0; i < a.consts.length; i++)
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
        if (s < 0)
            throw new Error("负数没有实数平方根");
        if (s == 0)
            return Rational.Zero;
        if (s == 1)
            return Rational.One;
        checkInt(s);
        var index: number = 2;
        var cu: number = SquareNumber[0];
        var r: number = 1;
        while (cu <= s && index <= MaxSquareBase - 1) {
            if (s % cu == 0) {
                r *= index;
                s /= cu;
                if (s == 1)
                    return new Rational(r, 1);
            } else {
                index++;
                cu = SquareNumber[index - 2];
            }
        }
        if (r == 1)
            return new SquareRoot(s);
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
        let ts: SpecialConst[] = new SpecialConst[this.consts.length];
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
        if (i.length == 1 && i[0] instanceof IrrationalItem)
            return <IrrationalItem>i[0];
        return new IrrationalItem(i);
    }
    opp(): ConstItem { return new ConstItem(Rational.MinusOne, this); }
    rec(): Irrational | ConstItem { return <Irrational | ConstItem>RealComputable.mulReal(this.consts?.rec(), this.squareRoot); }
}
class UncertainItem extends RealComputable {
    public readonly uncertains: Uncertain[];
    length(): number { return this.uncertains.length; }
    static create(...u: Uncertain[]): UncertainItem {
        return new UncertainItem(u);
    }
    constructor(u: Uncertain[]) {
        super();
        if (!u || u.length <= 0) throw new Error("无法构造无内容的未知数项");
        this.uncertains = u;
    }
    opp(): Monomial { return Monomial.createComplete(Rational.MinusOne, undefined, this); }
    rec(): UncertainItem {
        let tu: Uncertain[] = copyObject(this.uncertains);
        for (let i: number = 0; i < tu.length; i++)
            tu[i] = new Uncertain(tu[i].symbol, -tu[i].exponent);
        return new UncertainItem(tu);
    }
}
class Monomial extends RealComputable {
    public hasRational(): boolean { return this.const.hasRational(); }
    public hasIrrational(): boolean { return this.const.hasIrrational(); }
    public hasUncertain(): boolean { return this.uncertains != undefined; }
    public readonly const: ConstItem;
    public readonly uncertains: UncertainItem;
    private constructor(c: ConstItem, u: UncertainItem) {
        super();
        this.const = c ? c : new ConstItem(Rational.One, undefined);
        if (u && u.length() > 0)
            this.uncertains = u;
    }
    public static createComplete(r: Rational = Rational.One, i?: IrrationalItem, u?: UncertainItem): Monomial { return new Monomial(new ConstItem(r, i), u); }
    public static create(i: Rational | Irrational | ConstItem | Uncertain | UncertainItem): Monomial {
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
    }
    opp(): Monomial { return new Monomial(this.const.opp(), this.uncertains); }
    rec(): Rational | Irrational | Uncertain | UncertainItem | Monomial { return <Rational | Irrational | Uncertain | UncertainItem | Monomial>RealComputable.mulReal(this.const.rec(), this.uncertains.rec()); }
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
        if (m.length == 1)
            return m[0];
        return new Polynomial(m);
    }
    opp(): Polynomial {
        var tm = <Monomial[]>copyObject(this.monomials);
        for (let i: number; i < tm.length; i++)
            tm[i] = tm[i].opp();
        return new Polynomial(tm);
    }
    rec(): Rational | Irrational | Uncertain | UncertainItem | Monomial {
        if (this.monomials && this.monomials.length == 1)
            return this.monomials[0].rec();
        throw new Error("暂不支持取多项式倒数");
    }
}
function greatestCommonDivisor(a: number, b: number) {
    var c = a % b;
    if (c == 0)
        return b;
    return arguments.callee(b, c);
}