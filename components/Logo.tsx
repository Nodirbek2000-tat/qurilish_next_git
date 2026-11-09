import Link from "next/link";

/*
 * Arxan logosi — mijoz bergan rasmdan vektorga o'tkazilgan (har qanday o'lchamda tiniq).
 * Koordinatalar asl rasm (1065×1078) bo'yicha; kerakli qism viewBox bilan kesib olinadi.
 */

export const LOGO_GOLD = "#B69D5C";
const MARK = [
  "389,465 443,420 443,613 389,613",
  "459,530 512,487 512,613 459,613",
  "459,362 512,318 512,411 535,394 601,455 601,613 554,568 554,484 524,457 459,510",
  "546,258 601,309 601,430 546,378",
  "619,348 668,396 668,613 619,613",
];
const ARXAN = "M290.0 623.8 L215.8 722.0 L215.7 723.0 L217.0 723.4 L231.5 723.0 L281.0 659.5 L283.0 659.0 L326.0 722.9 L328.0 723.5 L357.4 723.0 L339.3 695.0Z M670.0 623.8 L599.0 720.5 L566.8 685.0 L555.5 672.0 L554.7 670.0 L594.9 628.0 L577.3 628.0 L547.0 658.7 L545.0 659.5 L516.0 627.6 L484.0 627.6 L483.7 629.0 L527.3 678.0 L506.6 700.0 L485.5 722.0 L486.0 723.4 L502.0 723.0 L536.0 689.3 L567.0 723.4 L613.0 723.2 L662.0 659.8 L705.0 722.8 L707.0 723.5 L736.0 723.4 L736.7 722.0 L733.5 717.0Z M754.0 624.4 L754.0 723.2 L775.1 723.0 L776.0 672.0 L844.0 725.0 L856.0 725.4 L856.7 720.0 L856.4 628.0 L833.9 628.0 L833.0 685.8Z M368.0 627.8 L368.0 723.0 L393.4 723.0 L394.0 644.5 L397.0 643.8 L424.0 643.9 L432.0 646.6 L436.6 652.0 L437.3 659.0 L436.5 663.0 L434.0 667.0 L430.0 670.0 L424.0 671.5 L396.6 672.0 L396.3 673.0 L411.0 689.6 L441.0 723.2 L470.5 723.0 L437.9 685.0 L452.0 679.4 L458.0 674.6 L462.2 669.0 L464.4 662.0 L465.2 654.0 L464.1 647.0 L461.3 641.0 L456.7 636.0 L450.0 631.5 L442.0 628.9 L435.0 627.7Z";
const RESIDENCE = "M347.0 737.6 L345.8 740.0 L345.9 761.0 L347.0 761.7 L350.0 761.5 L350.8 754.0 L355.0 753.5 L356.3 754.0 L360.8 760.0 L363.0 761.8 L366.0 761.8 L367.1 761.0 L361.8 754.0 L361.7 753.0 L364.5 751.0 L366.2 748.0 L366.4 744.0 L365.2 741.0 L363.0 738.8 L360.0 737.6Z M396.0 737.6 L395.0 739.0 L395.0 761.0 L396.0 761.8 L413.0 761.7 L413.7 759.0 L413.0 757.8 L400.0 757.5 L399.6 753.0 L399.8 752.0 L401.0 751.5 L411.0 751.6 L412.0 751.0 L412.1 749.0 L411.0 747.7 L400.0 747.4 L399.6 743.0 L400.0 741.9 L401.0 741.6 L413.0 741.4 L413.3 738.0Z M447.0 737.6 L442.5 741.0 L441.7 744.0 L442.4 747.0 L446.0 750.1 L455.0 752.6 L456.3 754.0 L456.2 756.0 L453.0 758.2 L450.0 758.3 L443.0 755.3 L440.8 757.0 L440.8 758.0 L445.0 761.1 L451.0 762.0 L456.0 761.3 L459.0 759.4 L460.5 757.0 L460.6 753.0 L459.0 750.1 L457.0 748.6 L447.0 746.0 L446.4 743.0 L448.0 741.4 L451.0 741.1 L454.0 741.4 L457.0 743.3 L459.0 742.2 L459.5 741.0 L457.8 739.0 L455.0 737.6Z M489.0 737.9 L488.4 740.0 L488.5 761.0 L492.0 761.8 L492.7 761.0 L492.7 739.0 L492.0 737.7Z M522.0 737.8 L521.5 747.0 L522.0 761.6 L536.0 761.3 L541.0 758.1 L543.6 754.0 L544.3 749.0 L543.4 745.0 L541.0 741.4 L537.0 738.7 L533.0 737.7Z M572.0 737.7 L571.0 739.0 L570.9 741.0 L571.2 761.0 L572.0 761.7 L588.0 761.7 L589.5 761.0 L589.6 759.0 L589.0 757.8 L588.0 757.7 L576.0 757.6 L575.5 755.0 L576.0 751.7 L588.3 751.0 L588.4 749.0 L587.0 747.7 L576.0 747.5 L575.4 743.0 L576.0 741.7 L577.0 741.6 L589.0 741.4 L589.3 738.0Z M618.0 737.6 L617.0 740.0 L617.2 761.0 L620.0 761.7 L621.3 761.0 L622.0 746.7 L635.0 761.3 L638.0 761.7 L638.7 761.0 L638.8 757.0 L638.4 738.0 L634.8 738.0 L634.0 753.2 L620.0 738.0Z M674.0 737.7 L669.0 740.3 L665.6 745.0 L664.6 750.0 L665.8 755.0 L670.0 760.1 L672.0 761.3 L676.0 762.0 L682.0 761.4 L686.0 759.0 L686.4 758.0 L684.6 756.0 L684.0 755.7 L682.0 756.7 L678.0 758.2 L676.0 758.0 L672.0 756.3 L669.6 753.0 L669.1 750.0 L669.8 746.0 L673.0 742.5 L675.0 741.7 L679.0 741.5 L684.0 743.7 L686.2 742.0 L686.1 741.0 L684.0 739.1 L680.0 737.5Z M714.0 737.8 L713.7 761.0 L717.0 761.8 L731.0 761.7 L731.7 761.0 L731.8 759.0 L731.0 757.8 L719.0 757.6 L718.2 757.0 L718.2 753.0 L718.4 752.0 L720.0 751.5 L730.0 751.5 L730.7 749.0 L730.0 747.8 L719.0 747.7 L718.2 747.0 L718.5 742.0 L731.0 741.5 L731.7 739.0 L730.0 737.6Z M350.7 742.0 L360.0 741.8 L362.2 745.0 L361.6 748.0 L359.0 749.5 L351.0 749.4Z M526.3 742.0 L534.0 741.8 L538.0 744.4 L539.3 747.0 L539.5 751.0 L539.1 753.0 L537.1 756.0 L533.0 757.6 L527.0 757.6 L526.2 757.0Z";

/** Faqat belgi (oltin binolar) */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg height={size} width={(size * 287) / 363} viewBox="385 254 287 363" aria-hidden="true" className={className}>
      <g fill={LOGO_GOLD}>
        {MARK.map((p) => <polygon key={p} className="logo-bar" points={p} />)}
      </g>
    </svg>
  );
}

/** Yozuv: ARXAN + RESIDENCE (rangi — matn rangi) */
export function LogoWord({ height = 30, className = "", residence = true }: { height?: number; className?: string; residence?: boolean }) {
  const vb = residence ? "210 618 652 148" : "210 618 652 112";
  const [, , w, h] = vb.split(" ").map(Number);
  return (
    <svg height={height} width={(height * w) / h} viewBox={vb} aria-hidden="true" className={className}>
      <path fill="currentColor" fillRule="evenodd" d={residence ? `${ARXAN} ${RESIDENCE}` : ARXAN} />
    </svg>
  );
}

/** To'liq logo ustma-ust: belgi tepada, yozuv pastda (footer, kirish sahifasi) */
export function LogoStacked({ height = 120, className = "" }: { height?: number; className?: string }) {
  return (
    <svg height={height} width={(height * 662) / 518} viewBox="205 252 662 518" role="img" aria-label="Arxan Residence" className={className}>
      <g fill={LOGO_GOLD}>{MARK.map((p) => <polygon key={p} points={p} />)}</g>
      <path fill="currentColor" fillRule="evenodd" d={`${ARXAN} ${RESIDENCE}`} />
    </svg>
  );
}

/** Sayt tepasidagi logo: belgi + yozuv yonma-yon */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Arxan Residence — bosh sahifa" className={`logo inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={38} />
      <LogoWord height={30} />
    </Link>
  );
}
