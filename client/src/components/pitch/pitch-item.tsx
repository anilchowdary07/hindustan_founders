import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PitchStatusType } from "@shared/schema";
import { Leaf, Landmark, Sprout, ShoppingCart, Truck, HeartPulse } from "lucide-react";

interface PitchItemProps {
  pitch: {
    id: number;
    name: string;
    description: string;
    location: string;
    status: PitchStatusType;
    category: string;
    userId: number;
    user?: {
      id: number;
      name: string;
      isVerified: boolean;
    };
  };
}

export default function PitchItem({ pitch }: PitchItemProps) {
  const getStatusColor = (status: PitchStatusType) => {
    return status === "idea" 
      ? "bg-green-100 text-green-800" 
      : "bg-blue-100 text-blue-800";
  };

  const getStatusText = (status: PitchStatusType) => {
    return status === "idea" 
      ? "Ideas" 
      : "Registered";
  };

  const getPitchIcon = () => {
    switch (pitch.category?.toLowerCase()) {
      case 'e-commerce':
        return <ShoppingCart className="text-indigo-600 text-2xl" />;
      case 'fintech':
        return <Landmark className="text-blue-600 text-2xl" />;
      case 'agritech':
        return <Sprout className="text-green-600 text-2xl" />;
      case 'logistics':
        return <Truck className="text-orange-600 text-2xl" />;
      case 'healthtech':
        return <HeartPulse className="text-red-600 text-2xl" />;
      default:
        return <Leaf className="text-green-600 text-2xl" />;
    }
  };

  const getPitchBgColor = () => {
    switch (pitch.category?.toLowerCase()) {
      case 'e-commerce':
        return 'bg-indigo-100';
      case 'fintech':
        return 'bg-blue-100';
      case 'agritech':
        return 'bg-green-100';
      case 'logistics':
        return 'bg-orange-100';
      case 'healthtech':
        return 'bg-red-100';
      default:
        return 'bg-green-100';
    }
  };

  return (
    <Card className="mb-4 border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className={`h-14 w-14 ${getPitchBgColor()} rounded-md flex items-center justify-center flex-shrink-0`}>
            {getPitchIcon()}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-lg">{pitch.name}</h3>
                <p className="text-gray-600">{pitch.description}</p>
                <p className="text-gray-500 text-sm mt-1">{pitch.location}</p>
              </div>
              <div>
                <Badge className={`${getStatusColor(pitch.status)}`}>
                  {getStatusText(pitch.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
