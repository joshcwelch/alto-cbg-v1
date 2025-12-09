import { useEffect, useRef, useState } from "react";
import { eventBus } from "../../game/events/eventBus";
import type { EventPayloadMap } from "../../game/events/eventBus";

export default function useUnitTokenFx(unitId: string) {
  const [fx, setFx] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
    const trigger = (cls: string) => {
      reset();
      setFx(cls);
      timer.current = window.setTimeout(() => setFx(null), 360);
    };

    const handleSummon = (payload: EventPayloadMap["UNIT_SUMMONED"]) => {
      if (payload.unitId === unitId) trigger("fx-pop");
    };
    const handleDamage = (payload: EventPayloadMap["UNIT_DAMAGED"]) => {
      if (payload.unitId === unitId) trigger("fx-damage");
    };
    const handleHeal = (payload: EventPayloadMap["UNIT_HEALED"]) => {
      if (payload.unitId === unitId) trigger("fx-heal");
    };
    const handleBuff = (payload: EventPayloadMap["UNIT_BUFFED"]) => {
      if (payload.unitId === unitId) trigger("fx-buff");
    };

    eventBus.on("UNIT_SUMMONED", handleSummon as any);
    eventBus.on("UNIT_DAMAGED", handleDamage as any);
    eventBus.on("UNIT_HEALED", handleHeal as any);
    eventBus.on("UNIT_BUFFED", handleBuff as any);

    return () => {
      reset();
      eventBus.off("UNIT_SUMMONED", handleSummon as any);
      eventBus.off("UNIT_DAMAGED", handleDamage as any);
      eventBus.off("UNIT_HEALED", handleHeal as any);
      eventBus.off("UNIT_BUFFED", handleBuff as any);
    };
  }, [unitId]);

  return fx;
}
