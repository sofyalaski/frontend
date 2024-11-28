export enum EmType {
    Helical = "helical",
    SingleParticle = "single-particle",
    SubtomogramAveraging = "subtomogram-averaging",
    Tomogram = "tomogram",
    ElectronCristallography = "electron-cristallography"
};

export enum EmFile {
    MainMap = 'vo-map',
    HalfMap1 = 'half-map1',
    HalfMap2 = 'half-map2',
    MaskMap = 'mask-map',
    AddMap = 'add-map',
    Coordinates = 'co-cif',
    Image = 'img-emdb',
    FSC = 'fsc-xml',
    LayerLines = "layer-lines",
    StructureFactors = "xs-cif",
    MTZ="xs-mtz",
};

export const EmFiles: { [f in EmFile]: OneDepFile } = {
    [EmFile.MainMap]: {
        name: "",
        type: "vo-map",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.HalfMap1]: {
        name: "",
        type: "half-map",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.HalfMap2]: {
        name: "",
        type: "half-map",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.MaskMap]: {
        name: "",
        type: "mask-map",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.AddMap]: {
        name: "",
        type: "add-map",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.Coordinates]: {
        name: "",
        type: "co-cif",
        file: null,
        details: "",
        required: false,
    },
    [EmFile.Image]: {
        name: "",
        type: "img-emdb",
        file: null,
        details: "",
        required: false,
    },
    [EmFile.FSC]: {
        name: "",
        type: "fsc-xml",
        file: null,
        details: "",
        required: false,
    },
    [EmFile.StructureFactors]: {
        name: "",
        type: "xs-cif", // need contour etc????
        file: null,
        details: "",
        required: false,
    },
    [EmFile.MTZ]: {
        name: "",
        type: "xs-mtz",
        file: null,
        details: "",
        required: false,
    },
    [EmFile.LayerLines]: {
        name: "",
        type: "layer-lines",
        file: null,
        details: "",
        required: false,
    },
};

export interface OneDepExperiment {
    type: string;
    subtype?: string;
}



interface EmMethod {
    value: EmType;
    viewValue: string;
    experiment: OneDepExperiment;
    files: DepositionFiles[];
}
export interface DepositionFiles {
    name: string;
    file: EmFile;
}
const BasicDepositionSet : DepositionFiles[] = [
    // add metadata later
    { name: 'Main Map', file: EmFile.MainMap },
    { name: 'Mask Map', file: EmFile.MaskMap },
    { name: 'Additional Map', file: EmFile.AddMap },
    { name: 'Public Image', file: EmFile.Image },
    { name: 'FSC-XML', file: EmFile.FSC },
  ];

const ExtendedDepositionSet: DepositionFiles[] = [
    { name: 'Half Map (1)', file: EmFile.HalfMap1 }, // not in tomography
    { name: 'Half Map (2)', file: EmFile.HalfMap2 },  // not in tomography
]

let HelicalDepositionSet:  DepositionFiles[] = BasicDepositionSet
export const MethodsList: EmMethod[] = [
    //FIXME need to add other data type of input
    { 
        value: EmType.Helical, 
        viewValue: 'Helical', 
        experiment: { type: "em", subtype: "helical" },
        files:{ ...BasicDepositionSet, ...ExtendedDepositionSet, ...{ name: 'Coordinates', file: EmFile.Coordinates }},
    },
    {   value: EmType.SingleParticle, 
        viewValue: 'Single Particle',
        experiment: { type: "em", subtype: "single" },
        files:{ ...BasicDepositionSet, ...ExtendedDepositionSet, ...{ name: 'Coordinates', file: EmFile.Coordinates }},
    },
    { 
        value: EmType.SubtomogramAveraging, 
        viewValue: 'Subtomogram Averaging',
        experiment: { type: "em", subtype: "subtomogram" },
        files:{ ...BasicDepositionSet, ...ExtendedDepositionSet, ...{ name: 'Coordinates', file: EmFile.Coordinates }},
    },
    { 
        value: EmType.Tomogram, 
        viewValue: 'Tomogram',
        experiment: { type: "em", subtype: "tomography" },
        files:BasicDepositionSet,
    },
    { 
        value: EmType.ElectronCristallography, 
        viewValue: 'Electron Crystallography',
        experiment: { type: "ec" },
        files:{ 
            ...BasicDepositionSet,
            ...ExtendedDepositionSet, 
            ...{ name: 'Coordinates', file: EmFile.Coordinates },
            ...{ name: 'Structure Factors', file: EmFile.StructureFactors },

            ...{ name: 'MTZ', file: EmFile.MTZ },
        },
    },
];




// export const Experiments: { [e in EmType]: OneDepExperiment } = {
//     [EmType.Helical]: { type: "em", subtype: "helical" },
//     [EmType.SingleParticle]: { type: "em", subtype: "single" },
//     [EmType.SubtomogramAveraging]: { type: "em", subtype: "subtomogram" },
//     [EmType.Tomogram]: { type: "em", subtype: "tomography" },
//     [EmType.ElectronCristallography]: { type: "ec" }
// };
export interface OneDepFile {
    name: string,
    type: string,
    file: File,
    contour?: number,
    details?: string,
    required: boolean,
}
