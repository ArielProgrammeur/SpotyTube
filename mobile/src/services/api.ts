import { PORT_CATALOGUE } from "@/config/serveur";
import type { Catalogue, Media, Protocole } from "@/types/catalogue";

const MAX_DELAY_MILLI_SEC = 5000;

export async function loadCatalogur(hote: string): Promise<Catalogue> {
    const controller = new AbortController();
    const minuteur = setTimeout(() => controller.abort(), MAX_DELAY_MILLI_SEC);
    try{
        const response = await fetch (`http://${hote}:${PORT_CATALOGUE}/catalog.json`, {signal: controller.signal});
        if (!response.ok) throw new Error (`Le serveur a repondu ${response.status}`);
        return (await response.json()) as Catalogue;
    }catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
            throw new Error ('Delai expire: Serveur Injoignable ?')
        }
        throw e;
    } finally {
        clearTimeout(minuteur)
    }
}


export function urlMedia(hote: string, catalogue: Catalogue, protocole: Protocole, media: Media): string{
    const settings = catalogue.Protocols[protocole];
    const path = media.paths[protocole];
    if (!settings || !path) throw new Error (`Protocole << ${protocole} >> indisponible pour ce media`);
    return `${settings.scheme}://${hote}:${settings.port}${path}`;
}

export function urlMinim(hote: string, path: string):string {
    return `http://${hote}:${PORT_CATALOGUE}${path}`;
}