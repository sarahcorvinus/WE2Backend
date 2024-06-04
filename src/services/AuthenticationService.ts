import { Pfleger } from "../model/PflegerModel";

/**
 * Prüft Name und Passwort, bei Erfolg ist `success` true 
 * und es wird die `id` und `role` ("u" oder "a") des Pflegers zurückgegeben
 * 
 * Falls kein Pfleger mit gegebener Name existiert oder das Passwort falsch ist, wird nur 
 * `false` zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(name: string, password: string): Promise<{ id: string, role: "a" | "u" } | false> {

    const toLogin = await Pfleger.findOne({name: name}).exec();
    if(!toLogin) return false;
    
    const isCorrect = await toLogin.isCorrectPassword(password);
    if(!isCorrect){
        return false;
    } else {
        type Role = "a" | "u";
        return {id: toLogin.id, role: toLogin.admin? "a"  : "u" as Role};
    }
}
