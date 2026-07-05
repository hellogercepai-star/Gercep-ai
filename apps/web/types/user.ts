export type UserRole = "owner" | "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  // relasi ke bisnis
  businesses: UserBusiness[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBusiness {
  businessId: string;
  businessName: string;
  // role user di bisnis itu
  role: "owner" | "manager" | "staff";
}
