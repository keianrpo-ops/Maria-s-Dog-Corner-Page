// Tabla de precios OFICIAL de Maria's Dog Corner
// https://www.mariasdogcorner.co.uk/

export const PRICING_TABLE = {
  "Dog Walk": {
    basePrice: 15,
    unit: "hour",
    minimum: 1,
    description: "FROM £15",
  },
  "Home Sitting": {
    basePrice: 45,
    unit: "night",
    minimum: 1,
    description: "£45 per night",
  },
  "Boarding": {
    custom: true,
    description: "CUSTOM - Contact for quote",
  },
  "Grooming": {
    basePrice: 35,
    unit: "service",
    minimum: 1,
    description: "FROM £35 (depends on dog size)",
    requiresSize: true,
  },
  "Pop-in Visits": {
    basePrice: 12,
    unit: "visit",
    minimum: 1,
    description: "£12 per visit",
  },
};

export type DogSize = "small" | "medium" | "large" | "xlarge";

// Precios de Grooming según tamaño del perro
export const GROOMING_PRICES: Record<DogSize, number> = {
  small: 35,   // Hasta 10kg (Chihuahua, Pomeranian, Yorkshire, etc.)
  medium: 45,  // 10-25kg (Cocker Spaniel, Beagle, Bulldog, etc.)
  large: 55,   // 25-40kg (Labrador, Golden Retriever, German Shepherd, etc.)
  xlarge: 70,  // Más de 40kg (Great Dane, Mastiff, Saint Bernard, etc.)
};

export function calculatePrice(
  service: string,
  duration: number,
  dogSize?: DogSize
): { price: number; breakdown: string } | null {
  const pricing = PRICING_TABLE[service as keyof typeof PRICING_TABLE];

  if (!pricing) {
    console.error(`Service not found in pricing table: ${service}`);
    return null;
  }

  // Servicios custom (Boarding)
  if ("custom" in pricing && pricing.custom) {
    return {
      price: 0,
      breakdown: "Custom pricing - please contact us for a quote",
    };
  }

  // Grooming con tamaño de perro
  if (service === "Grooming") {
    if (!dogSize) {
      return {
        price: pricing.basePrice,
        breakdown: `FROM £${pricing.basePrice} (size not specified)`,
      };
    }
    const price = GROOMING_PRICES[dogSize];
    return {
      price,
      breakdown: `£${price} (${dogSize} dog)`,
    };
  }

  // Servicios por hora/noche/visita
  if (!("basePrice" in pricing)) {
    console.error(`Invalid pricing structure for service: ${service}`);
    return null;
  }

  const units = Math.max(duration, pricing.minimum || 1);
  const price = pricing.basePrice * units;

  let unitText = pricing.unit;
  if (units > 1 && unitText) {
    unitText = unitText + "s";
  }

  return {
    price,
    breakdown: `£${price} (${units} ${unitText} × £${pricing.basePrice})`,
  };
}

export function getDogSizeFromWeight(weightKg: number): DogSize {
  if (weightKg <= 10) return "small";
  if (weightKg <= 25) return "medium";
  if (weightKg <= 40) return "large";
  return "xlarge";
}

export function getDogSizeFromBreed(breed: string): DogSize {
  const breedLower = breed.toLowerCase();
  
  // Small breeds (hasta 10kg)
  const smallBreeds = [
    "chihuahua", "pomeranian", "yorkshire", "yorkie", "maltese", 
    "shih tzu", "pug", "dachshund", "toy", "mini", "miniature"
  ];
  if (smallBreeds.some(b => breedLower.includes(b))) return "small";
  
  // XLarge breeds (más de 40kg)
  const xlargeBreeds = [
    "great dane", "mastiff", "saint bernard", "bernese", 
    "newfoundland", "leonberger", "irish wolfhound"
  ];
  if (xlargeBreeds.some(b => breedLower.includes(b))) return "xlarge";
  
  // Large breeds (25-40kg)
  const largeBreeds = [
    "german shepherd", "golden retriever", "labrador", "rottweiler", 
    "doberman", "husky", "malamute", "boxer", "akita", "weimaraner"
  ];
  if (largeBreeds.some(b => breedLower.includes(b))) return "large";
  
  // Default to medium (10-25kg)
  return "medium";
}

export function formatPrice(price: number): string {
  return `£${price}`;
}

export function getServiceDescription(service: string): string {
  const pricing = PRICING_TABLE[service as keyof typeof PRICING_TABLE];
  return pricing?.description || "Service not found";
}