
interface IconProps {
  className?: string;
  size?: number;
}

export function SpaghettiIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Plate */}
      <ellipse cx="32" cy="48" rx="28" ry="10" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" />
      <ellipse cx="32" cy="46" rx="24" ry="7" fill="#FFFFFF" />
      {/* Pasta mound */}
      <path d="M12 44C12 30 20 22 32 22C44 22 52 30 52 44C52 46 44 48 32 48C20 48 12 46 12 44Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
      {/* Pasta swirl strands */}
      <path d="M16 40C20 32 28 36 34 30C40 24 46 32 48 42" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 44C24 38 30 42 38 36C44 32 46 40 46 44" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 32C26 26 36 28 42 34" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      {/* Giant Meatball */}
      <circle cx="32" cy="25" r="13" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
      <circle cx="28" cy="22" r="3" fill="#7F1D1D" />
      <circle cx="36" cy="27" r="2.5" fill="#7F1D1D" />
      <circle cx="31" cy="30" r="2" fill="#7F1D1D" />
      <ellipse cx="28" cy="18" rx="3.5" ry="1.5" transform="rotate(-30 28 18)" fill="#FCA5A5" opacity="0.8" />
      {/* Basil leaf */}
      <path d="M32 14C30 9 35 6 38 8C41 10 38 15 32 14Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
    </svg>
  );
}

export function BurgerIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top bun */}
      <path d="M10 26C10 14 20 8 32 8C44 8 54 14 54 26C54 28 48 30 32 30C16 30 10 28 10 26Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
      {/* Sesame seeds */}
      <ellipse cx="24" cy="16" rx="1.5" ry="2.5" transform="rotate(30 24 16)" fill="#FEF3C7" />
      <ellipse cx="32" cy="13" rx="1.5" ry="2.5" fill="#FEF3C7" />
      <ellipse cx="40" cy="17" rx="1.5" ry="2.5" transform="rotate(-30 40 17)" fill="#FEF3C7" />
      <ellipse cx="28" cy="22" rx="1.5" ry="2.5" transform="rotate(15 28 22)" fill="#FEF3C7" />
      <ellipse cx="36" cy="21" rx="1.5" ry="2.5" transform="rotate(-15 36 21)" fill="#FEF3C7" />
      {/* Lettuce wavy */}
      <path d="M8 30Q14 34 20 30Q26 35 32 30Q38 35 44 30Q50 34 56 30L55 35Q49 39 43 35Q37 40 31 35Q25 40 19 35Q13 39 9 35Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      {/* Melted Cheese */}
      <path d="M10 36L54 36L48 44L40 39L32 46L24 39L16 45Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      {/* Beef Patty */}
      <rect x="10" y="41" width="44" height="9" rx="4.5" fill="#78350F" stroke="#451A03" strokeWidth="2" />
      {/* Bottom bun */}
      <path d="M12 51C12 50 18 49 32 49C46 49 52 50 52 51C52 57 44 60 32 60C20 60 12 57 12 51Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
    </svg>
  );
}

export function PancakeIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Plate */}
      <ellipse cx="32" cy="54" rx="28" ry="8" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      {/* Bottom pancake */}
      <ellipse cx="32" cy="46" rx="22" ry="7" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <path d="M10 46C10 50 20 52 32 52C44 52 54 50 54 46" stroke="#B45309" strokeWidth="2" fill="none" />
      {/* Middle pancake */}
      <ellipse cx="32" cy="38" rx="21" ry="6.5" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
      <path d="M11 38C11 42 20 44 32 44C44 44 53 42 53 38" stroke="#B45309" strokeWidth="2" fill="none" />
      {/* Top pancake */}
      <ellipse cx="32" cy="30" rx="20" ry="6" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
      {/* Syrup drip */}
      <path d="M22 30C22 36 26 38 28 35C30 32 34 38 38 34C40 31 44 36 44 30" fill="#B45309" opacity="0.8" />
      {/* Melting Butter slab */}
      <rect x="27" y="21" width="10" height="7" rx="2" transform="rotate(-8 27 21)" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
    </svg>
  );
}

export function PizzaIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Crust */}
      <path d="M8 18C24 10 40 10 56 18C52 24 44 26 32 22C20 26 12 24 8 18Z" fill="#D97706" stroke="#92400E" strokeWidth="2.5" />
      {/* Pizza body */}
      <path d="M12 20L32 58L52 20C40 25 24 25 12 20Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
      {/* Sauce rim */}
      <path d="M15 22C26 26 38 26 49 22" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      {/* Pepperoni slices */}
      <circle cx="28" cy="30" r="5" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
      <circle cx="38" cy="36" r="4.5" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
      <circle cx="27" cy="44" r="4" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
      {/* Herbs */}
      <circle cx="34" cy="27" r="1.5" fill="#16A34A" />
      <circle cx="22" cy="36" r="1.5" fill="#16A34A" />
      <circle cx="34" cy="46" r="1.5" fill="#16A34A" />
      {/* Cheese drip */}
      <path d="M30 52C32 60 33 60 34 52" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function IceCreamIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Waffle Cone */}
      <path d="M18 36L32 60L46 36Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <path d="M22 41L42 41M25 47L39 47M28 53L36 53" stroke="#B45309" strokeWidth="1.5" />
      <path d="M24 38L38 52M40 38L26 52" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bottom scoop (Chocolate) */}
      <circle cx="32" cy="34" r="13" fill="#78350F" stroke="#451A03" strokeWidth="2" />
      {/* Middle scoop (Strawberry) */}
      <circle cx="32" cy="24" r="12" fill="#F43F5E" stroke="#BE123C" strokeWidth="2" />
      {/* Top scoop (Vanilla) */}
      <circle cx="32" cy="14" r="11" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
      {/* Cherry on top */}
      <circle cx="32" cy="7" r="4.5" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
      <path d="M33 5C35 1 39 2 40 4" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sprinkles */}
      <line x1="28" y1="13" x2="31" y2="15" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="22" x2="37" y2="24" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="25" x2="29" y2="23" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MilkIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top fold */}
      <path d="M22 8L32 14L42 8L32 6Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
      <path d="M22 8L20 16L32 20L44 16L42 8" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
      {/* Carton Body */}
      <path d="M20 16L20 56L44 56L44 16Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
      {/* Blue Banner */}
      <rect x="20" y="26" width="24" height="18" fill="#38BDF8" />
      {/* Drop badge */}
      <circle cx="32" cy="35" r="5" fill="#FFFFFF" />
      <path d="M32 32C30 35 34 37 32 38" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="24" y="48" width="16" height="3" rx="1.5" fill="#94A3B8" />
    </svg>
  );
}

export function SaladIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Salad Leaves */}
      <circle cx="24" cy="24" r="10" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
      <circle cx="38" cy="22" r="11" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
      <circle cx="31" cy="18" r="9" fill="#16A34A" stroke="#15803D" strokeWidth="2" />
      {/* Tomato slices */}
      <circle cx="26" cy="26" r="6" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
      <circle cx="38" cy="26" r="5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
      {/* Cucumber */}
      <ellipse cx="32" cy="28" rx="4" ry="2" transform="rotate(30 32 28)" fill="#86EFAC" stroke="#15803D" strokeWidth="1" />
      {/* Wooden Bowl */}
      <path d="M10 30C10 48 20 56 32 56C44 56 54 48 54 30Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
      <ellipse cx="32" cy="30" rx="22" ry="5" fill="#D97706" />
    </svg>
  );
}

export function DonutIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Dough */}
      <circle cx="32" cy="32" r="24" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
      {/* Pink Icing */}
      <path d="M12 32C12 20 20 12 32 12C44 12 52 20 52 32C52 38 48 42 42 42C38 42 36 38 32 38C28 38 26 44 20 44C14 44 12 38 12 32Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="2" />
      {/* Hole */}
      <circle cx="32" cy="32" r="8" fill="#BAE6FD" stroke="#B45309" strokeWidth="2" />
      {/* Sprinkles */}
      <line x1="22" y1="20" x2="26" y2="22" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="18" x2="42" y2="20" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="30" x2="46" y2="28" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="30" x2="22" y2="32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="42" x2="32" y2="40" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CanIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Can Cylinder */}
      <rect x="18" y="18" width="28" height="34" fill="#94A3B8" stroke="#475569" strokeWidth="2.5" />
      {/* Bottom rim */}
      <ellipse cx="32" cy="52" rx="14" ry="4" fill="#64748B" stroke="#475569" strokeWidth="2" />
      {/* Top rim */}
      <ellipse cx="32" cy="18" rx="14" ry="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
      <ellipse cx="32" cy="18" rx="10" ry="2.5" fill="#94A3B8" />
      {/* Pull tab */}
      <path d="M30 18L26 14A3 3 0 0 1 30 12L34 16" stroke="#475569" strokeWidth="1.5" fill="none" />
      {/* Label Banner */}
      <rect x="18" y="24" width="28" height="22" fill="#DC2626" />
      <rect x="22" y="32" width="20" height="6" rx="2" fill="#FEF08A" />
    </svg>
  );
}

export function AppleIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Apple body */}
      <path d="M32 20C24 10 10 16 10 32C10 48 24 58 32 58C40 58 54 48 54 32C54 16 40 10 32 20Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
      {/* Stem */}
      <path d="M32 20C32 14 36 8 38 6" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      {/* Leaf */}
      <path d="M34 14C42 10 46 14 42 18C38 18 35 16 34 14Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      {/* Gloss highlight */}
      <ellipse cx="20" cy="28" rx="4" ry="8" transform="rotate(-25 20 28)" fill="#FFFFFF" opacity="0.4" />
    </svg>
  );
}

export function TacoIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Taco shell back */}
      <ellipse cx="32" cy="38" rx="24" ry="14" fill="#D97706" />
      {/* Meat & Fillings */}
      <path d="M12 36Q22 24 32 24Q42 24 52 36Z" fill="#78350F" />
      {/* Lettuce */}
      <path d="M14 34Q20 20 26 30Q32 18 38 28Q44 20 50 34Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      {/* Tomato chunks */}
      <rect x="22" y="24" width="5" height="5" rx="1" fill="#EF4444" />
      <rect x="36" y="22" width="5" height="5" rx="1" fill="#EF4444" />
      {/* Cheese shreds */}
      <path d="M28 22L32 28M32 20L34 26M42 24L44 30" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
      {/* Shell front */}
      <path d="M8 38C8 54 22 58 32 58C42 58 56 54 56 38L52 36C46 48 38 52 32 52C26 52 18 48 12 36Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
    </svg>
  );
}

export function EggIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Egg 1 */}
      <path d="M22 22C14 22 10 32 10 42C10 52 18 56 26 56C34 56 42 52 42 42C42 32 30 22 22 22Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
      <ellipse cx="18" cy="36" rx="2" ry="5" transform="rotate(-20 18 36)" fill="#FFFFFF" opacity="0.6" />
      {/* Egg 2 in front */}
      <path d="M42 16C36 16 30 26 30 36C30 46 36 52 44 52C52 52 56 46 56 36C56 26 48 16 42 16Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
      <ellipse cx="38" cy="30" rx="2" ry="5" transform="rotate(-20 38 30)" fill="#BAE6FD" opacity="0.5" />
    </svg>
  );
}

/** Helper component to render any food icon by string keyword */
export function DynamicFoodIcon({ name, size = 28, className = '' }: { name: string; size?: number; className?: string }) {
  const s = (name || '').toLowerCase();
  if (s.includes('spaghetti') || s.includes('meatball') || s.includes('pasta')) {
    return <SpaghettiIcon size={size} className={className} />;
  }
  if (s.includes('burger') || s.includes('cheeseburger') || s.includes('sandwich')) {
    return <BurgerIcon size={size} className={className} />;
  }
  if (s.includes('pancake') || s.includes('waffle') || s.includes('flapjack') || s.includes('breakfast')) {
    return <PancakeIcon size={size} className={className} />;
  }
  if (s.includes('pizza')) {
    return <PizzaIcon size={size} className={className} />;
  }
  if (s.includes('ice cream') || s.includes('dessert') || s.includes('gelato') || s.includes('cone')) {
    return <IceCreamIcon size={size} className={className} />;
  }
  if (s.includes('milk') || s.includes('dairy') || s.includes('juice') || s.includes('drink') || s.includes('water')) {
    return <MilkIcon size={size} className={className} />;
  }
  if (s.includes('salad') || s.includes('lettuce') || s.includes('vegetable') || s.includes('green') || s.includes('crisper')) {
    return <SaladIcon size={size} className={className} />;
  }
  if (s.includes('donut') || s.includes('doughnut') || s.includes('cake') || s.includes('cookie') || s.includes('sweet')) {
    return <DonutIcon size={size} className={className} />;
  }
  if (s.includes('can') || s.includes('soup') || s.includes('tin') || s.includes('sardine') || s.includes('bean') || s.includes('pantry')) {
    return <CanIcon size={size} className={className} />;
  }
  if (s.includes('taco') || s.includes('burrito') || s.includes('mexican')) {
    return <TacoIcon size={size} className={className} />;
  }
  if (s.includes('egg') || s.includes('omelet')) {
    return <EggIcon size={size} className={className} />;
  }
  if (s.includes('apple') || s.includes('fruit') || s.includes('orange') || s.includes('banana') || s.includes('berry')) {
    return <AppleIcon size={size} className={className} />;
  }
  return <SpaghettiIcon size={size} className={className} />;
}
