/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GreenSpace {
  AD: string;
  ILCE: string;
  ADRES: string;
  "TEKERLEKLİ SANDALYE UYGUNLUK DURUMU": string;
  "TÜR"?: string;
  KOORDİNATLARI: string;
  lat: number;
  lng: number;
}

export interface CSVRow {
  AD: string;
  "PARK İSMİ"?: string;
  ILCE: string;
  ADRES: string;
  "TEKERLEKLİ SANDALYE UYGUNLUK DURUMU": string;
  "TÜR"?: string;
  KOORDİNATLARI: string;
}
