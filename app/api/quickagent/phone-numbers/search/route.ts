import { NextResponse } from "next/server";
import { searchPhoneNumbers } from "@/lib/voice-providers/vapi-provider";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaCode = searchParams.get("areaCode");

    if (!areaCode) {
      return NextResponse.json(
        { error: "Area code is required" },
        { status: 400 }
      );
    }

    console.log("Searching for phone numbers in area code:", areaCode);

    // Search for available numbers in the requested area code
    const numbers = await searchPhoneNumbers({
      areaCode,
      limit: 10,
    });

    if (numbers.length > 0) {
      return NextResponse.json({
        available: true,
        numbers: numbers.map(n => ({
          phoneNumber: n.phoneNumber,
          locality: n.locality || "Unknown",
        })),
        alternatives: [],
      });
    }

    // If no numbers found, search for nearby area codes
    const nearbyAreaCodes = generateNearbyAreaCodes(areaCode);
    const alternatives = [];

    for (const nearbyCode of nearbyAreaCodes.slice(0, 3)) {
      try {
        const nearbyNumbers = await searchPhoneNumbers({
          areaCode: nearbyCode,
          limit: 1,
        });
        
        if (nearbyNumbers.length > 0) {
          alternatives.push({
            areaCode: nearbyCode,
            count: nearbyNumbers.length,
          });
        }
      } catch (error) {
        console.error(`Error searching area code ${nearbyCode}:`, error);
      }
    }

    return NextResponse.json({
      available: false,
      numbers: [],
      alternatives,
    });
  } catch (error) {
    console.error("Error searching phone numbers:", error);
    return NextResponse.json(
      { error: "Failed to search phone numbers", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function generateNearbyAreaCodes(areaCode: string): string[] {
  // Simple logic to generate nearby area codes
  // In production, you'd want a more sophisticated approach
  const code = parseInt(areaCode);
  const nearby = [];

  for (let i = -10; i <= 10; i++) {
    if (i === 0) continue;
    const nearbyCode = (code + i).toString().padStart(3, "0");
    if (nearbyCode.length === 3 && nearbyCode >= "200") {
      nearby.push(nearbyCode);
    }
  }

  return nearby;
}

