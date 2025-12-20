// @ts-nocheck

import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import {
  useAddProductMutation,
  useCreateProcessMutation,
  useCreateProformaInvoiceMutation,
  useUpdateProcessMutation,
} from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Process from "../../Dynamic Add Components/ProductionProcess";

interface UpdateProcess {
  closeDrawerHandler: () => void;
  fetchProcessHandler: () => void;
  id: string | undefined;
}

const UpdateProcess: React.FC<UpdateProcess> = ({
  closeDrawerHandler,
  fetchProcessHandler,
  id,
}) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [bomName, setBomName] = useState<string | undefined>();
  const [totalCost, setTotalCost] = useState<string | undefined>();
  const [createdBy, setCreatedBy] = useState<string | undefined>();
  const [processes, setProcesses] = useState<string[] | []>([]);
  const [processStatuses, setProcessStatuses] = useState<{
    [key: number]: { start: boolean; done: boolean };
  }>({});

  const [products, setProducts] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([
    {
      item_name: "",
      description: "",
      quantity: "",
      uom: "",
      category: "",
      assembly_phase: "",
      supplier: "",
      supporting_doc: "",
      comments: "",
      unit_cost: "",
      total_part_cost: "",
      estimated_quantity: "",
      used_quantity: "",
      uom_used_quantity: "",
    },
  ]);

  const [bomId, setBomId] = useState<string | undefined>();
  const [productionProcessId, setProductionProcessId] = useState<
    string | undefined
  >();
  const [finishedGood, setFinishedGood] = useState<
    { value: string; label: string } | undefined
  >();
  const [finishedGoodDescription, setFinishedGoodDescription] = useState<
    string | undefined
  >();
  const [finishedGoodQuantity, setFinishedGoodQuantity] = useState<
    number | undefined
  >();
  const [finishedGoodRemainingQty, setFinishedGoodRemainingQty] = useState<
    number | undefined
  >();

  const [finishedGoodProducedQuantity, setFinishedGoodProducedQuantity] =
    useState<number | undefined>();
  // store original fetched finished good quantities to detect if user changed values
  const [originalFinishedGoodEstimated, setOriginalFinishedGoodEstimated] =
    useState<number | undefined>();
  const [originalFinishedGoodProduced, setOriginalFinishedGoodProduced] =
    useState<number | undefined>();
  const [finishedGoodUom, setFinishedGoodUom] = useState<string | undefined>();
  const [finishedGoodCategory, setFinishedGoodCategory] = useState<
    string | undefined
  >();
  const finishedGoodSupportingDoc = useRef<HTMLInputElement | null>(null);
  const [finishedGoodComments, setFinishedGoodComments] = useState<
    string | undefined
  >();
  const [finishedGoodCost, setFinishedGoodCost] = useState<
    number | undefined
  >();
  const [finishedGoodUnitCost, setFinishedGoodUnitCost] = useState<
    string | undefined
  >();
  const [materialUnit, setMaterialUnit] = useState(null); // state to describe the UOM
  const [submitBtnText, setSubmitBtnText] = useState<string>("Update");
  const [processStatus, setProcessStatus] = useState<string | undefined>();
  const [rawMaterialApprovalPending, setRawMaterialApprovalPending] =
    useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<{ done: string }[]>(
    []
  );
  const [showMarkAsDone, setShowMarkAsDone] = useState(false);
  console.log(showMarkAsDone)
  const [scrapMaterials, setScrapMaterials] = useState<any[]>([
    {
      _id: "",
      item_name: "",
      description: "",
      estimated_quantity: "",
      produced_quantity: "",
      uom: "",
      unit_cost: "",
      total_part_cost: "",
    },
  ]);
  const [scrapCatalog, setScrapCatalog] = useState<any[] | []>([]);
  const [scrapOptions, setScrapOptions] = useState<{ value: string; label: string }[]>([]);

  const [updateProcess] = useUpdateProcessMutation();

  // ... all your useState hooks etc.

  const computeMarkAsDone = () => {
    // 1. Finished goods check - compare current state values
    const fgEstimated = Number(finishedGoodQuantity ?? 0);
    const fgProduced = Number(finishedGoodProducedQuantity ?? 0);
    const fgOk = fgEstimated === fgProduced && fgEstimated > 0; // must be non-zero and equal

    // // 2. Raw materials check - use current selectedProducts state
    // const rawOk = selectedProducts.every((rm: any) => {
    //   const est = Number(rm?.estimated_quantity) || 0;
    //   const used = Number(rm?.used_quantity) || 0;
    //   return est === used && est > 0; // must be non-zero and equal
    // });

    // 3. All processes done - use current processStatuses state
    const allProcessesDone = Object.values(processStatuses).every(
      (status: any) => status?.done === true
    );

    // 4. Check if data has been updated from server (not just user input)
    // This ensures that the server has confirmed the quantities match
    const hasServerUpdatedData = Boolean(
      originalFinishedGoodEstimated !== undefined &&
        originalFinishedGoodProduced !== undefined &&
        Number(originalFinishedGoodEstimated) ===
          Number(originalFinishedGoodProduced) &&
        selectedProducts.every((rm: any) => {
          const est = Number(rm?.estimated_quantity) || 0;
          const used = Number(rm?.used_quantity) || 0;
          return est === used && est > 0;
        })
    );

    return fgOk && allProcessesDone && hasServerUpdatedData;
  };

  // console.log(computeMarkAsDone());
  const onFinishedGoodChangeHandler = (d: any) => {
    setFinishedGood(d);
    const product: any = products.filter((prd: any) => prd._id === d.value)[0];
    setFinishedGoodCategory(product.category);
    setFinishedGoodUom(product.uom);
    setFinishedGoodUnitCost(product.price);
    if (finishedGoodQuantity) {
      setFinishedGoodCost(product.price * +finishedGoodQuantity);
    }
  };

  const onFinishedGoodQntyChangeHandler = (qty: number) => {
    setFinishedGoodQuantity(qty);
    if (finishedGoodUnitCost) {
      setFinishedGoodCost(+finishedGoodUnitCost * qty);
    }
  };
  const completedCount = Object.values(processStatuses).filter(
    (status) => status?.done
  ).length;

  const totalProcesses = processes.length;
  const remainingCount = totalProcesses - completedCount;

  // Calculate percentage
  const progressPercentage =
    totalProcesses > 0
      ? Math.round((completedCount / totalProcesses) * 100)
      : 0;

  const handleProcessStatusChange = (
    processIndex: number,
    statusType: "start" | "done",
    checked: boolean
  ) => {
    setProcessStatuses((prev) => {
      const updated = {
        ...prev,
        [processIndex]: {
          ...prev[processIndex],
          [statusType]: checked,
        },
      };

      // Auto-check "start" when "done" is checked
      if (statusType === "done" && checked) {
        updated[processIndex].start = true;
      }

      // Uncheck "done" when "start" is unchecked
      if (statusType === "start" && !checked) {
        updated[processIndex].done = false;
      }

      return updated;
    });
  };
  // console.log("All Product", products)
  const updateProcessHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted) return; // no-op when already completed

    // Hide mark as done button during update
    setShowMarkAsDone(false);

    const updatedProducts = selectedProducts.map((m) => {
      const est = Number(m.estimated_quantity) || 0;
      const itemUom = m.uom; // estimated ka base UOM (example: "kgs")
      const usedUom = m.uom_used_quantity || itemUom; // user selected (example: "g")
      const used = Number(m.used_quantity) || 0;

      // ✅ convert used qty into base UOM
      const usedInItemUom = convertUOM(used, usedUom, itemUom);

      return {
        ...m,
        used_quantity: usedInItemUom,
        uom_used_quantity: itemUom,
        remaining_quantity: est - usedInItemUom,
      };
    });
    console.log(submitBtnText)
    const updatedFinishedGoodRemaining =
      (Number(finishedGoodQuantity) || 0) -
      (Number(finishedGoodProducedQuantity) || 0);
    let modifiedScrapMaterials =
      scrapMaterials?.[0]?.item_name &&
      scrapMaterials?.map((material) => {
        const materialData: any = {
          item: material?.item_name?.value,
          description: material?.description,
          estimated_quantity: material?.estimated_quantity,
          produced_quantity: material?.produced_quantity,
          total_part_cost: material?.total_part_cost,
        };

        if (material?._id && material._id.trim() !== "") {
          materialData._id = material._id;
        }

        return materialData;
      });

    const updatedProcesses = processes.map((proc: any, index) => ({
      process: (proc as any)?.process ?? proc,
      start: processStatuses[index]?.start || false,
      done: processStatuses[index]?.done || false,
      work_done: processProgress[index]?.done || "", // string or number allowed
    }));
    // Map raw materials with selected UOM
    // let modifiedRawMaterials = selectedProducts.map((material) => ({
    //   ...material,
    //   uom_used_quantity: material.uom, // <-- this is the selected dropdown value
    // }));

    // Map scrap materials with selected UOM
    modifiedScrapMaterials = scrapMaterials.map((material) => ({
      ...material,
      uom_produced_quantity: material.uom_produced_quantity, // <-- this sends the selected dropdown value!
    }));
    // console.log("ye hai modified scrap material", modifiedScrapMaterials);

    const data = {
      bom: {
        _id: bomId,
        raw_materials: updatedProducts,
        scrap_materials: modifiedScrapMaterials,
        processes: updatedProcesses,
        finished_good: {
          item: finishedGood?.value,
          description: finishedGoodDescription,
          estimated_quantity: finishedGoodQuantity,
          produced_quantity: finishedGoodProducedQuantity,
          remaining_quantity: updatedFinishedGoodRemaining, // yaha set hoga
          comments: finishedGoodComments,
          cost: finishedGoodCost,
        },
        bom_name: bomName,
        total_cost: totalCost,
      },
      status: processStatus,
      _id: productionProcessId,
    };

    try {
      setIsUpdating(true);
      const response = await updateProcess(data).unwrap();
      // console.log(response);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);

      setSelectedProducts(updatedProducts);
      setFinishedGoodRemainingQty(updatedFinishedGoodRemaining);

      // After successful update, update originals with the server-confirmed values
      setOriginalFinishedGoodEstimated(Number(finishedGoodQuantity) || 0);
      setOriginalFinishedGoodProduced(
        Number(finishedGoodProducedQuantity) || 0
      );

      // Re-fetch the updated data from server to ensure we have the latest state
      await fetchProcessDetailsHandler(id || "");

      closeDrawerHandler();
      fetchProcessHandler();
      // console.log("1", computeMarkAsDone());
      setShowMarkAsDone(computeMarkAsDone());
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
      // Reset showMarkAsDone to previous state on error
    } finally {
      setIsUpdating(false);
    }
  };

  // ===== UOM conversion helpers =====
  const UNIT_FACTORS: Record<string, Record<string, number>> = {
    // base: grams
    mass: {
      mg: 0.001,
      cg: 0.01,
      g: 1,
      kgs: 1000,
      lb: 453.59237,
      oz: 28.349523125,
      tonne: 1_000_000,
      ton: 907_184.74, // US ton
      lt: 1_016_046.91, // Long ton UK

      st: 6350.29318,
    },
    // base: millilitres
    liquid: {
      ml: 1,
      ltr: 1000,
      gal: 3785.411784,
      qt: 946.352946,
      pt: 473.176473,
      "fl oz": 29.5735295625,
      cup: 240,
      tbsp: 15,
      tsp: 5,
    },
    // base: cubic meter
    gas: {
      m3: 1,
      cm3: 1e-6,
      cf: 0.028316846592,
      in3: 1.6387064e-5,
      ft3: 0.028316846592,
      L: 0.001,
    },
    // base: pascal
    pressure: {
      pa: 1,
      kpa: 1000,
      mpa: 1_000_000,
      bar: 100_000,
      mb: 100,
      hpa: 100,
      atm: 101_325,
      psi: 6894.757293168,
      mmHg: 133.3223684211,
      inHg: 3386.38815789,
      torr: 133.3223684211,
    },
    // base: meter
    length: {
      mm: 0.001,
      cm: 0.01,
      mtr: 1,
      km: 1000,
      inch: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.344,
      nm: 1852,
    },

    // base: square meter
    area: {
      m2: 1,
      cm2: 0.0001,
      mm2: 0.000001,
      ft2: 0.092903,
      yd2: 0.836127,
      sqft: 0.092903,
      acre: 4046.8564224,
      ha: 10_000,
    },

    // base: joule
    energy: {
      j: 1,
      kj: 1000,
      mj: 1_000_000,
      wh: 3600,
      kwh: 3_600_000,
      cal: 4.184,
    },

    // base: Kelvin (temperature multipliers not linear, set null)
    temperature: {
      c: null, // needs formula: K = C + 273.15
      f: null, // needs formula: K = (F - 32) * 5/9 + 273.15
      k: 1,
    },
    // count units (no conversion)
    count: {
      pcs: 1,
      nos: 1,
      units: 1,
      item: 1,
      pack: 1,
      dozen: 12,
      box: 1,
      set: 1,
      roll: 1,
      pair: 1,
      sheet: 1,
    },
  };

  const detectCategoryKey = (uom: string): string | null => {
    if (UNIT_FACTORS.mass[uom] !== undefined) return "mass";
    if (UNIT_FACTORS.liquid[uom] !== undefined) return "liquid";
    if (UNIT_FACTORS.gas[uom] !== undefined) return "gas";
    if (UNIT_FACTORS.pressure[uom] !== undefined) return "pressure";
    if (UNIT_FACTORS.length[uom] !== undefined) return "length";
    if (UNIT_FACTORS.count[uom] !== undefined) return "count";
    return null;
  };

  const convertUOM = (value: number, fromUom: string, toUom: string) => {
    if (!fromUom || !toUom || fromUom === toUom) return value;
    const fromCat = detectCategoryKey(fromUom);
    const toCat = detectCategoryKey(toUom);
    if (!fromCat || !toCat || fromCat !== toCat) {
      // different/unknown categories → no conversion, return original
      return value;
    }
    const baseFactors = UNIT_FACTORS[fromCat];
    const fromFactor = baseFactors[fromUom];
    const toFactor = baseFactors[toUom];
    if (fromFactor === undefined || toFactor === undefined) return value;
    // convert to base, then to target
    const inBase = value * fromFactor;
    return inBase / toFactor;
  };

  // Code to implement units dropdown in Raw Materials and Scrap Materials
  const massUnits = [
    { value: "kgs", label: "Kilogram" },
    { value: "g", label: "Gram" },
    { value: "mg", label: "Milligram" },
    { value: "cg", label: "Centigram" },
    { value: "lb", label: "Pound" },
    { value: "oz", label: "Ounce" },
    { value: "tonne", label: "Tonne" },
    { value: "st", label: "Stone" },
  ];

  const liquidUnits = [
    { value: "ltr", label: "Litre" },
    { value: "ml", label: "Millilitre" },
    { value: "gal", label: "Gallon (US)" },
    { value: "qt", label: "Quart (US)" },
    { value: "pt", label: "Pint (US)" },
    { value: "fl oz", label: "Fluid Ounce (US)" },
    { value: "cup", label: "Cup (US)" },
    { value: "tbsp", label: "Tablespoon" },
    { value: "tsp", label: "Teaspoon" },
  ];

  const gasUnits = [
    { value: "m3", label: "Cubic Meter" },
    { value: "cm3", label: "Cubic Centimeter" },
    { value: "cf", label: "Cubic Feet" },
    // { value: "in3", label: "Cubic Inch" },
    { value: "ft3", label: "Cubic Foot" },
    { value: "in3", label: "Cubic Inch" },
    { value: "ft3", label: "Cubic Foot" },
    { value: "L", label: "Litre (for gases)" },
  ];

  const pressureUnits = [
    { value: "pa", label: "Pascal" },
    { value: "kpa", label: "Kilopascal" },
    { value: "mpa", label: "Megapascal" },
    { value: "bar", label: "Bar" },
    { value: "atm", label: "Atmosphere" },
    { value: "psi", label: "Pound per Square Inch" },
    { value: "mmHg", label: "Millimeter of Mercury" },
    { value: "inHg", label: "Inch of Mercury" },
    { value: "torr", label: "Torr" },
  ];

  const lengthUnits = [
    { value: "mm", label: "Millimeter" },
    { value: "cm", label: "Centimeter" },
    { value: "mtr", label: "Meter" },
    { value: "km", label: "Kilometer" },
    { value: "inch", label: "Inch" },
    { value: "ft", label: "Foot" },
    { value: "yd", label: "Yard" },
    { value: "mi", label: "Mile" },
    { value: "nm", label: "Nautical Mile" },
  ];

  const countUnits = [
    { value: "pcs", label: "Pieces" },
    { value: "nos", label: "Numbers" },
    { value: "units", label: "Units" },
    { value: "item", label: "Item" },
    { value: "pack", label: "Pack" },
    { value: "dozen", label: "Dozen" },
    { value: "box", label: "Box" },
    { value: "set", label: "Set" },
    { value: "roll", label: "Roll" },
    { value: "pair", label: "Pair" },
    { value: "sheet", label: "Sheet" },
    { value: "roll", label: "Roll" },
  ];

  const areaUnits = [
    { value: "m2", label: "Square Meter" },
    { value: "cm2", label: "Square Centimeter" },
    { value: "mm2", label: "Square Millimeter" },
    { value: "ft2", label: "Square Foot" },
    { value: "yd2", label: "Square Yard" },
    { value: "sqft", label: "Square Foot" },
    { value: "acre", label: "Acre" },
    { value: "ha", label: "Hectare" },
    { value: "roll", label: "Roll" },
  ];
  const energyUnits = [
    { value: "j", label: "Joule" },
    { value: "kj", label: "Kilojoule" },
    { value: "mj", label: "Megajoule" },
    { value: "wh", label: "Watt Hour" },
    { value: "kwh", label: "Kilowatt Hour" },
    { value: "cal", label: "Calorie" },
  ];

  const temperatureUnits = [
    { value: "c", label: "Celsius" },
    { value: "f", label: "Fahrenheit" },
    { value: "k", label: "Kelvin" },
  ];

  // 2. Function to find category by uom value
  const getUnitCategory = (uom) => {
    if (massUnits.some((unit) => unit.value === uom)) return massUnits;
    if (liquidUnits.some((unit) => unit.value === uom)) return liquidUnits;
    if (gasUnits.some((unit) => unit.value === uom)) return gasUnits;
    if (pressureUnits.some((unit) => unit.value === uom)) return pressureUnits;
    if (lengthUnits.some((unit) => unit.value === uom)) return lengthUnits;
    if (countUnits.some((unit) => unit.value === uom)) return countUnits;
    if (areaUnits.some((unit) => unit.value === uom)) return areaUnits;
    if (energyUnits.some((unit) => unit.value === uom)) return energyUnits;
    if (temperatureUnits.some((unit) => unit.value === uom)) return temperatureUnits;
    return [];
  };
  // const getOptionFromValue = (value, options) =>
  //   options.find((opt) => opt.value === value) || null;
  // const uom = selectedProducts[0].uom;
  // const filteredOptions = getUnitCategory(uom);

  const markProcessDoneHandler = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL +
          `production-process/done/${productionProcessId}`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      closeDrawerHandler();
      fetchProcessHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const computeMarkAsDoneWithData = (
    fgEstimated: number,
    fgProduced: number,
    rawMaterials: any[],
    processStatuses: { [key: number]: { start: boolean; done: boolean } }
  ) => {
    // 1. Finished goods check
    const fgOk = fgEstimated === fgProduced && fgEstimated > 0;

    // 2. Raw materials check
    // const rawOk = rawMaterials?.every((rm: any) => {
    //   const est = Number(rm?.estimated_quantity) || 0;
    //   const used = Number(rm?.used_quantity) || 0;
    //   return est === used && est > 0;
    // });

    // 3. All processes done
    const allProcessesDone = Object.values(processStatuses).every(
      (status: any) => status?.done === true
    );

    // 4. Server data validation
    const hasServerUpdatedData = Boolean(
      fgEstimated !== undefined &&
      fgProduced !== undefined &&
      fgEstimated === fgProduced 
      // rawMaterials.every((rm: any) => {
      //   const est = Number(rm?.estimated_quantity) || 0;
      //   const used = Number(rm?.used_quantity) || 0;
      //   return est === used && est > 0;
      // })
    );

    return fgOk && allProcessesDone && hasServerUpdatedData;
  };

  const fetchProcessDetailsHandler = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `production-process/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();

      // console.log("main data carrier : ", data);

      if (!data.success) {
        throw new Error(data.message);
      }

      setProductionProcessId(data.production_process._id);
      setBomId(data.production_process.bom._id);
      setBomName(data.production_process.bom.bom_name);
      setTotalCost(data.production_process.bom.total_cost);
      setCreatedBy(
        (data.production_process.bom?.creator?.first_name || "") +
          " " +
          (data.production_process.bom?.creator?.last_name || "")
      );

      const modifiedRawMaterials =
        data.production_process.bom.raw_materials.map((material: any) => {
          const prod = data.production_process.raw_materials.find(
            (p: any) => (p?.item?._id || p?.item) === (material?.item?._id || material?.item)
          );

          return {
            _id: material?._id,
            item: material?.item?._id || material?.item || "",
            item_name: material?.item
              ? { value: material.item._id, label: material.item.name }
              : null,
            description: material?.description || "",
            quantity: material?.quantity || "",
            uom: material?.item?.uom || "",
            category: material?.item?.category || "",
            assembly_phase: {
              value: material?.assembly_phase,
              label: material?.assembly_phase,
            },
            supplier: {
              value: material?.supplier?._id,
              label: material?.supplier?.name,
            },
            supporting_doc: "",
            uom_used_quantity: material?.uom_used_quantity || "",
            comments: material?.comments || "",
            unit_cost: material?.item?.price || "",
            total_part_cost: material?.total_part_cost || "",
            estimated_quantity: prod?.estimated_quantity || 0,
            used_quantity: prod?.used_quantity || 0,
            remaining_quantity: prod?.remaining_quantity || 0,
          };
        });

      const scrap: any = [];
      data.production_process?.bom?.scrap_materials?.forEach(
        (material: any) => {
          const itemObj = material && material.item ? material.item : null;
          const itemId = itemObj && itemObj._id
            ? itemObj._id
            : typeof material?.item === "string"
            ? material.item
            : undefined;

          const sc = (data.production_process.scrap_materials || []).find(
            (p: any) => String(p?.item || "") === String(itemId || "")
          ) || {};

          const scFromCatalog = (scrapCatalog || []).find(
            (s: any) => String(s?._id || "") === String(itemId || "")
          );

          const itemSelect = itemObj && itemObj._id && itemObj.name
            ? { value: itemObj._id, label: itemObj.name }
            : scFromCatalog && scFromCatalog._id && scFromCatalog.Scrap_name
            ? { value: scFromCatalog._id, label: scFromCatalog.Scrap_name }
            : material?.scrap_name
            ? { value: material?.scrap_id || "", label: material.scrap_name }
            : null;

          scrap.push({
            _id: material?._id || "",
            item: itemId,
            item_name: itemSelect,
            description: material?.description || "",
            estimated_quantity: sc?.estimated_quantity || material?.quantity || 0,
            produced_quantity: sc?.produced_quantity || 0,
            uom: itemObj?.uom || scFromCatalog?.uom || material?.uom || "",
            unit_cost: itemObj?.price || scFromCatalog?.price || material?.unit_cost || "",
            total_part_cost: material?.total_part_cost || "",
            uom_produced_quantity: material?.uom_used_quantity || "",
          });
        }
      );

      const processList = data?.production_process?.bom?.processes || [];
      const processesData = data.production_process?.processes || [];
      const processProgressData = processesData.map((p: any) => ({
        done: p.work_done || "",
      }));

      const fetchedStatuses = data.production_process.processes || [];
      const initialStatuses: {
        [key: number]: { start: boolean; done: boolean };
      } = {};

      processList.forEach((_: any, index: number) => {
        initialStatuses[index] = {
          start: fetchedStatuses[index]?.start ?? false,
          done: fetchedStatuses[index]?.done ?? false,
        };
      });

      const fetchedEstimated = Number(
        data.production_process.bom.finished_good.quantity || 0
      );
      const fetchedProduced = Number(
        data.production_process.finished_good.produced_quantity || 0
      );

      // Set all the state first
      setSelectedProducts(modifiedRawMaterials);
      setScrapMaterials(scrap);
      setProcesses(processList);
      setProcessProgress(processProgressData);
      setProcessStatuses(initialStatuses);

      setFinishedGood({
        value: data.production_process.bom.finished_good?.item?._id || "",
        label: data.production_process.bom.finished_good?.item?.name || "",
      });
      setFinishedGoodDescription(
        data.production_process.bom.finished_good?.description
      );
      setFinishedGoodQuantity(fetchedEstimated);
      setFinishedGoodUom(data.production_process.bom.finished_good?.item?.uom || "");
      setFinishedGoodUnitCost(
        data.production_process.bom.finished_good?.item?.price || 0
      );
      setFinishedGoodCost(data.production_process.bom.finished_good.cost);
      setFinishedGoodCategory(
        data.production_process.bom.finished_good?.item?.category || ""
      );
      setFinishedGoodComments(
        data.production_process.bom.finished_good.comments
      );
      setFinishedGoodProducedQuantity(fetchedProduced);
      setFinishedGoodRemainingQty(
        data.production_process.finished_good.remaining_quantity
      );

      // store originals for change detection
      setOriginalFinishedGoodEstimated(fetchedEstimated);
      setOriginalFinishedGoodProduced(fetchedProduced);

      // Handle status logic
      const fetchedStatus = String(
        data.production_process.status || ""
      ).toLowerCase();

      if (fetchedStatus === "raw materials approved") {
        setSubmitBtnText("Start Production");
        setProcessStatus("work in progress");
      } else if (fetchedStatus === "work in progress") {
        setSubmitBtnText("Update");
        setProcessStatus("work in progress");
      } else if (fetchedStatus === "completed") {
        setIsCompleted(true);
      } else if (fetchedStatus === "raw material approval pending") {
        setRawMaterialApprovalPending(true);
      } 

      // Use setTimeout to ensure state updates are applied before computing
      setTimeout(() => {
        // Compute markAsDone with the actual data instead of relying on state
        const computeResult = computeMarkAsDoneWithData(
          fetchedEstimated,
          fetchedProduced,
          modifiedRawMaterials,
          initialStatuses
        );
        console.log("computeResult:", computeResult);
        setShowMarkAsDone(computeResult);
      }, 0);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScrapCatalog = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `scrap/get?limit=${500}&page=${1}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      const scrapData = Array.isArray(data?.data) ? data.data : [];
      setScrapCatalog(scrapData);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchProcessDetailsHandler(id || "");
    fetchScrapCatalog();
  }, [id]);

  useEffect(() => {
    const options = products.map((prod) => ({
      value: prod._id,
      label: prod.name,
    }));
    setProductOptions(options);
  }, [products]);

  useEffect(() => {
    const options = (scrapCatalog || []).map((sc: any) => ({
      value: sc._id,
      label: sc.Scrap_name,
    }));
    setScrapOptions(options);
  }, [scrapCatalog]);

  useEffect(() => {
    if (!scrapCatalog.length || !scrapMaterials.length) return;
    setScrapMaterials((prev) =>
      prev.map((m: any) => {
        if (m.item_name) return m;
        const itemId = typeof m.item === "string" ? m.item : undefined;
        const sc = (scrapCatalog || []).find(
          (s: any) => String(s?._id || "") === String(itemId || "")
        );
        return sc && sc._id
          ? {
              ...m,
              item_name: { value: sc._id, label: sc.Scrap_name },
              uom: m.uom || sc.uom || "",
              unit_cost: m.unit_cost || sc.price || "",
            }
          : m;
      })
    );
  }, [scrapCatalog]);

  useEffect(() => {
    if (
      selectedProducts[selectedProducts.length - 1].unit_cost !== "" &&
      selectedProducts[selectedProducts.length - 1].quantity !== ""
    ) {
      const cost = selectedProducts.reduce(
        (prev, current) => prev + +current.unit_cost * +current.quantity,
        0
      );
      setTotalCost(cost);
    }
  }, [selectedProducts]);

  // Remove automatic showMarkAsDone updates - only compute after server confirmation
  useEffect(() => {
    // Don't automatically compute on every state change
    // Only compute after server data is confirmed
  }, [
    finishedGoodQuantity,
    finishedGoodProducedQuantity,
    selectedProducts,
    processStatuses,
  ]);
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: "#d1d5db",
      color: "#374151",
      minHeight: "32px",
      borderRadius: "6px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#dbeafe" : "white",
      color: "#374151",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#bfdbfe",
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "6px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
  };

  // console.log(processStatuses);
  // Disable Update and Mark as Done when finished good estimated and produced quantities are equal
  // AND the values have not been changed since fetch (originals match current)
  const finishedGoodUnchangedAndEqual = Boolean(
    originalFinishedGoodEstimated !== undefined &&
      originalFinishedGoodProduced !== undefined &&
      Number(originalFinishedGoodEstimated) ===
        Number(originalFinishedGoodProduced) &&
      Number(originalFinishedGoodEstimated) ===
        Number(finishedGoodQuantity || 0) &&
      Number(originalFinishedGoodProduced) ===
        Number(finishedGoodProducedQuantity || 0)
  );
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 text-black flex border items-center justify-between">
            <h2 className="text-xl font-semibold">Update Production Process</h2>
            <button
              onClick={closeDrawerHandler}
              className="p-1 border rounded transition-colors duration-200"
            >
              <BiX size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <form onSubmit={updateProcessHandler}>
              {/* BOM Details Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    BOM Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BOM Name
                      </label>
                      <input
                        type="text"
                        value={bomName || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Cost
                      </label>
                      <input
                        type={cookies?.role === "admin" ? "number" : "text"}
                        value={
                          cookies?.role === "admin"
                            ? totalCost || ""
                            : totalCost
                            ? "*****"
                            : ""
                        }
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created By
                      </label>
                      <input
                        type="text"
                        value={createdBy || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Finished Good Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Finished Good
                  </h3>

                  {/* Header (desktop) */}
                  <div className="hidden sm:grid grid-cols-9 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>FINISHED GOODS</div>
                    <div>EST. QTY</div>
                    <div>UOM</div>
                    <div>PROD. QTY</div>
                    <div>REMAIN. QTY</div>
                    <div>CATEGORY</div>
                    <div>COMMENTS</div>
                    <div>UNIT COST</div>
                    <div>COST</div>
                  </div>

                  {/* Row */}
                  <div className="border border-t-0 border-gray-300">
                    <div className="grid grid-cols-1 sm:grid-cols-9 gap-4 px-3 py-4 items-center bg-white">
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Finished Goods
                        </label>
                        <Select
                          styles={customStyles}
                          className="text-sm"
                          options={productOptions}
                          placeholder="Select"
                          value={finishedGood}
                          onChange={onFinishedGoodChangeHandler}
                          isDisabled={true || finishedGoodUnchangedAndEqual}
                        />
                      </div>
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Est. Qty
                        </label>
                        <input
                          type="number"
                          value={finishedGoodQuantity || ""}
                          onChange={(e) =>
                            onFinishedGoodQntyChangeHandler(+e.target.value)
                          }
                          placeholder="Estimated Quantity"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          UOM
                        </label>
                        <input
                          type="text"
                          value={finishedGoodUom || ""}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Prod. Qty
                        </label>
                        <input
                          type="number"
                          value={finishedGoodProducedQuantity || ""}
                          onChange={(e) => {
                            const value = +e.target.value;
                            const maxAllowed =
                              Number(finishedGoodQuantity) || 0;

                            if (value > maxAllowed) {
                              toast.error(
                                "Produced Qty cannot be more than Estimated Qty"
                              );
                              return;
                            }

                            setFinishedGoodProducedQuantity(value);
                          }}
                          placeholder="Produced Quantity"
                          className={`w-full px-2 py-1 border border-gray-300 rounded text-sm ${finishedGoodUnchangedAndEqual
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                            }`}
                          disabled={finishedGoodUnchangedAndEqual}
                        />
                      </div>
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          REMAIN. QTY
                        </label>
                        <input
                          type="number"
                          value={finishedGoodRemainingQty || ""}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Category
                        </label>
                        <input
                          type="text"
                          value={finishedGoodCategory || ""}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Comments
                        </label>
                        <input
                          type="text"
                          value={finishedGoodComments || ""}
                          onChange={(e) =>
                            setFinishedGoodComments(e.target.value)
                          }
                          placeholder="Comments"
                          className={`w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 ${finishedGoodUnchangedAndEqual
                            ? "cursor-not-allowed"
                            : ""
                            }`}
                          readOnly
                          disabled={finishedGoodUnchangedAndEqual}
                        />
                      </div>
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Unit Cost
                        </label>
                        <input
                          type={cookies?.role === "admin" ? "number" : "text"}
                          value={
                            cookies?.role === "admin"
                              ? finishedGoodUnitCost || ""
                              : finishedGoodUnitCost
                              ? "*****"
                              : ""
                          }
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Cost
                        </label>
                        <input
                          type={cookies?.role === "admin" ? "number" : "text"}
                          value={
                            cookies?.role === "admin"
                              ? finishedGoodCost || ""
                              : finishedGoodCost
                              ? "*****"
                              : ""
                          }
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Materials Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Raw Materials
                    </h3>
                  </div>

                  {/* Header (desktop) */}
                  <div className="hidden sm:grid grid-cols-10 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>PRODUCT NAME</div>
                    <div>EST. QTY</div>
                    <div>UOM</div>
                    <div>USED QTY</div>
                    <div>UOM*</div>
                    <div>REMAIN. QTY</div>
                    <div>CATEGORY</div>
                    <div>COMMENTS</div>
                    <div>UNIT COST</div>
                    <div>TOTAL COST</div>
                  </div>

                  {/* Rows */}
                  <div className="border border-t-0 border-gray-300">
                    {selectedProducts.map((material, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-10 gap-4 px-3 py-4 items-center bg-white border-b border-gray-200 last:border-b-0"
                      >
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Product Name
                          </label>
                          <Select
                            styles={customStyles}
                            className="text-sm"
                            options={scrapOptions}
                            placeholder="Select"
                            value={material.item_name}
                            isDisabled
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Est. Qty
                          </label>
                          <input
                            type="number"
                            value={material.estimated_quantity || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            UOM
                          </label>

                          <input
                            type="text"
                            value={material.uom || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Used Qty
                          </label>
                          <input
                            type="number"
                            value={material.used_quantity || ""}
                            onChange={(e) => {
                              if (finishedGoodUnchangedAndEqual) return;
                              const raw =
                                e.target.value === "" ? "" : +e.target.value;
                              const newMaterials = [...selectedProducts];

                              if (raw === "") {
                                newMaterials[index].used_quantity = "";
                                newMaterials[index].remaining_quantity =
                                  material.estimated_quantity; // reset
                                setSelectedProducts(newMaterials);
                                return;
                              }

                              const est =
                                Number(material.estimated_quantity) || 0;
                              const itemUom = material.uom;
                              const usedUom =
                                material.uom_used_quantity || itemUom;

                              const usedInItemUom = convertUOM(
                                Number(raw) || 0,
                                usedUom,
                                itemUom
                              );
                              const remain = est - usedInItemUom;

                              if (usedInItemUom > est) {
                                toast.error(
                                  "Used Qty (after conversion) cannot exceed Estimated Qty"
                                );
                                return;
                              }

                              newMaterials[index].used_quantity = raw;
                              newMaterials[index].remaining_quantity =
                                remain < 0 ? 0 : remain;
                              setSelectedProducts(newMaterials);
                            }}
                            placeholder="Used Quantity"
                            className={`w-full px-2 py-1 border border-gray-300 rounded text-sm ${finishedGoodUnchangedAndEqual
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            disabled={finishedGoodUnchangedAndEqual}
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            UOM*
                          </label>
                          <select
                            value={material.uom_used_quantity || ""}
                            onChange={(e) => {
                              if (finishedGoodUnchangedAndEqual) return;
                              const value = e.target.value;
                              const newMaterials = [...selectedProducts];
                              newMaterials[index].uom_used_quantity = value;
                              setSelectedProducts(newMaterials);
                            }}
                            className={`w-full h-8 px-2 py-1 text-sm border border-gray-300 rounded ${finishedGoodUnchangedAndEqual
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            disabled={finishedGoodUnchangedAndEqual}
                          >
                            <option value="">Select UOM</option>
                            {getUnitCategory(material.uom).map((unit) => (
                              <option key={unit.value} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            REMAIN. QTY
                          </label>
                          <input
                            type="number"
                            value={material.remaining_quantity || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Category
                          </label>
                          <input
                            type="text"
                            value={material.category || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Comments
                          </label>
                          <input
                            type="text"
                            value={material.comments || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Unit Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.unit_cost || ""
                                : material.unit_cost
                                ? "*****"
                                : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Total Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.total_part_cost || ""
                                : material.total_part_cost
                                ? "*****"
                                : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Container with flex-wrap */}
              <div className="flex flex-wrap gap-4 p-4 w-full">
                {processes.map((process: any, index) => {
                  const status = processStatuses[index];
                  const progress = processProgress[index] || { done: 0 };

                  const handleDoneChange = (value: string) => {
                    const updatedProgress = [...processProgress];
                    updatedProgress[index] = { done: value };
                    setProcessProgress(updatedProgress);
                  };

                  return (
                    <div key={index} className="w-[280px]">
                      <div
                        className={`border p-3 rounded-lg ${status?.done
                          ? "bg-green-50 border-green-200"
                          : status?.start
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Process {index + 1}
                          </label>
                          <div
                            className={`px-2 py-1 rounded text-xs  font-medium ${status?.done
                              ? "bg-green-100 text-green-800"
                              : status?.start
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {status?.done
                              ? "Completed"
                              : status?.start
                              ? "In Progress"
                              : "Not Start"}
                          </div>
                        </div>

                        {/* Process name */}
                        <input
                          type="text"
                          value={(process as any)?.process ?? process}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white mb-3 text-sm"
                        />

                        {/* Done input */}
                        <div className="mb-3">
                          <label className="block text-xs text-gray-700">
                            Work Done
                          </label>
                          <input
                            type="text"
                            value={progress.done}
                            onChange={(e) => handleDoneChange(e.target.value)}
                            placeholder="Enter work done (e.g. 50% completed, 20 pcs)"
                            className={`w-full px-2 py-1 border border-gray-300 rounded text-sm ${finishedGoodUnchangedAndEqual
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            disabled={finishedGoodUnchangedAndEqual}
                          />
                        </div>

                        {/* Start / Done checkboxes */}
                        <div className="flex  gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={status?.start || false}
                              onChange={(e) =>
                                handleProcessStatusChange(
                                  index,
                                  "start",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              disabled={finishedGoodUnchangedAndEqual}
                            />
                            <span className="text-sm text-gray-700">Start</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={status?.done || false}
                              onChange={(e) =>
                                handleProcessStatusChange(
                                  index,
                                  "done",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-green-600 border-gray-300 rounded"
                              disabled={finishedGoodUnchangedAndEqual}
                            />
                            <span className="text-sm text-gray-700">Done</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scrap Materials Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scrap Materials
                    </h3>
                  </div>

                  {/* Header (desktop) */}
                  <div className="hidden sm:grid grid-cols-8 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>PRODUCT NAME</div>
                    <div>EST. QTY</div>
                    <div>UOM</div>
                    <div>PROD. QTY</div>
                    {/* <div>UOM*</div> */}
                    <div>COMMENT</div>
                    <div>UNIT COST</div>
                    <div>TOTAL COST</div>
                  </div>

                  {/* Rows */}
                  <div className="border border-t-0 border-gray-300">
                    {scrapMaterials.map((material, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-8 gap-4 px-3 py-4 items-center bg-white border-b border-gray-200 last:border-b-0"
                      >
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Product Name
                          </label>
                          <Select
                            styles={customStyles}
                            className="text-sm"
                            options={productOptions}
                            placeholder="Select"
                            value={material.item_name}
                            isDisabled
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Est. Qty
                          </label>
                          <input
                            type="number"
                            value={material.estimated_quantity || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            UOM
                          </label>
                          <input
                            type="text"
                            value={material.uom || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Prod. Qty
                          </label>
                          <input
                            type="number"
                            value={material.produced_quantity || ""}
                            onChange={(e) => {
                              if (finishedGoodUnchangedAndEqual) return;
                              const newMaterials = [...scrapMaterials];
                              newMaterials[index].produced_quantity =
                                e.target.value;
                              setScrapMaterials(newMaterials);
                            }}
                            placeholder="Produced Quantity"
                            className={`w-full px-2 py-1 border border-gray-300 rounded text-sm ${finishedGoodUnchangedAndEqual
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                              }`}
                            disabled={finishedGoodUnchangedAndEqual}
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Comment
                          </label>
                          <input
                            type="text"
                            value={material.description || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Unit Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.unit_cost || ""
                                : material.unit_cost
                                ? "*****"
                                : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Total Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.total_part_cost || ""
                                : material.total_part_cost
                                ? "*****"
                                : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex gap-4">
                    <button
                      disabled={
                        isCompleted ||
                        rawMaterialApprovalPending ||
                        finishedGoodUnchangedAndEqual
                      }
                      type="submit"
                      className={`px-6 py-2 rounded transition-colors duration-200 ${isCompleted ||
                        rawMaterialApprovalPending ||
                        finishedGoodUnchangedAndEqual
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-500 text-white"
                        }`}
                    >
                      {isUpdating ? "Updating..." : submitBtnText}
                    </button>
                    {/* {submitBtnText === "Update" && showMarkAsDone && (
                      <button
                        // disabled={
                        //   isCompleted ||
                        //   rawMaterialApprovalPending ||
                        //   finishedGoodUnchangedAndEqual
                        // }
                        type="button"
                        onClick={markProcessDoneHandler}
                        className={`px-6 py-2 rounded transition-colors duration-200 ${isCompleted || rawMaterialApprovalPending ||
                          finishedGoodUnchangedAndEqual
                          ? "bg-gradient-to-r from-green-500 to-green-500 text-white"
                          : "bg-gradient-to-r from-green-500 to-green-500 text-white"
                          }`}
                      >
                        {isUpdating ? "Processing..." : "Mark as Done"}
                      </button>
                    )} */}

                    
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProcess;
