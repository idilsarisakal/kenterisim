/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { GreenSpace, CSVRow } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXGxxo534bR8rj6rdq2ng9nYZnkcIL6EhxHWghjXCt5jymROefA3xKgpvLo5UhNaoEU02IjkPmtYrT/pub?output=csv';

export async function fetchGreenSpaces(): Promise<GreenSpace[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const spaces: GreenSpace[] = results.data
            .map((row) => {
              const coords = row.KOORDİNATLARI?.split(',').map((c) => parseFloat(c.trim()));
              
              if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                return {
                  ...row,
                  AD: row.AD || row["PARK İSMİ"] || "İsimsiz Yeşil Alan",
                  lat: coords[0],
                  lng: coords[1],
                };
              }
              return null;
            })
            .filter((space): space is GreenSpace => space !== null);
          
          resolve(spaces);
        } catch (error) {
          reject(new Error('Veri işlenirken bir hata oluştu.'));
        }
      },
      error: (error) => {
        reject(new Error(`Veri yüklenemedi: ${error.message}`));
      },
    });
  });
}
