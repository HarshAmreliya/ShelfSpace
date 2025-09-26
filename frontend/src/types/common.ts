export type ID = string | number;

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}
