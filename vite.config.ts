import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "/pmis/edms/",
    envPrefix: ["VITE_"],
});
