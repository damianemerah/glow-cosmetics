import type { BeautyTip } from "@/types/index";

interface BeautyTipsProps {
  tips: BeautyTip[];
}

export default function BeautyTips({ tips }: BeautyTipsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tips.map((tip, index) => (
        <div key={index} className="p-4 border rounded-md">
          <div className="text-3xl mb-2">{tip.icon}</div>
          <h4 className="font-semibold mb-2">{tip.title}</h4>
          <p className="text-sm text-muted-foreground">{tip.description}</p>
        </div>
      ))}
    </div>
  );
}
