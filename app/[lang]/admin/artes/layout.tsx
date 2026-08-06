import {
  Bebas_Neue,
  Inter,
  Montserrat,
  Oswald,
  Playfair_Display,
  Poppins,
} from "next/font/google";

const inter = Inter({ variable: "--font-art-inter", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-art-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const montserrat = Montserrat({
  variable: "--font-art-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const oswald = Oswald({
  variable: "--font-art-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const bebas = Bebas_Neue({
  variable: "--font-art-bebas",
  subsets: ["latin"],
  weight: "400",
});
const playfair = Playfair_Display({
  variable: "--font-art-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function ArtesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${oswald.variable} ${bebas.variable} ${playfair.variable} h-full`}
    >
      {children}
    </div>
  );
}
