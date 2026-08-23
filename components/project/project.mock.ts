import type { ProjectFilterOption } from "./project.types";

/** Frontend-only options until the project-list web service is defined. */
export const projectFilterOptions: ProjectFilterOption[] = [
    {
        id: "project-001",
        projectName: "Project Alpha",
        projectCode: "EDMS-01",
        contractNumber: "1405-001",
    },
    {
        id: "project-002",
        projectName: "Project Beta",
        projectCode: "EDMS-02",
        contractNumber: "1405-014",
    },
    {
        id: "project-003",
        projectName: "Project Gamma",
        projectCode: "EDMS-03",
        contractNumber: "1405-027",
    },
];
