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
    MTZ = "xs-mtz",
};
enum BasicDeposition {
    MainMap = 'vo-map',
    MaskMap = 'mask-map',
    AddMap = 'add-map',
    Image = 'img-emdb',
    FSC = 'fsc-xml',
    LayerLines = "layer-lines",
}
enum ExtendedDeposition {
    HalfMap1 = 'half-map1',
    HalfMap2 = 'half-map2',
    Coordinates = 'co-cif',
}
enum CristallographyDeposition{
    StructureFactors = "xs-cif",
    MTZ = "xs-mtz",
}
export interface OneDepExperiment {
    type: string;
    subtype?: string;
}

interface EmMethod {
    value: EmType;
    viewValue: string;
    experiment: OneDepExperiment;
    files: { [key in EmFile]?: DepositionFiles };
}

export interface DepositionFiles {
    nameFE: string;
    type: string,
    fileName: string,
    file: File,
    contour?: number,
    details?: string,
    required: boolean,
}

const BasicDepositionSet: { [f in BasicDeposition]: DepositionFiles } = {
    // add metadata later
    [EmFile.MainMap]: {
        nameFE: 'Main Map',
        type: "vo-map",
        fileName: "",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.MaskMap]: {
        nameFE: 'Mask Map',
        type: "mask-map",
        fileName: "",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.AddMap]: {
        nameFE: 'Additional Map',
        type: "add-map",
        fileName: "",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.Image]: {
        nameFE: 'Public Image',
        type: "img-emdb",
        fileName: "",
        file: null,
        details: "",
        required: false,
    },
    [EmFile.FSC]: {
        nameFE: 'FSC-XML',
        type: "fsc-xml",
        fileName: "",
        file: null,
        details: "",
        required: false,
    },
    [EmFile.LayerLines]: {
        nameFE: 'Other: Layer Lines Data ',
        type: "layer-lines",
        fileName: "",
        file: null,
        details: "",
        required: false,
    },
};

const ExtendedDepositionSet: { [f in ExtendedDeposition]: DepositionFiles } = {
    [EmFile.HalfMap1]: {
        nameFE: 'Half Map (1)',
        type: "half-map",
        fileName: "",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.HalfMap2]: {
        nameFE: 'Half Map (2)',
        type: "half-map",
        fileName: "",
        file: null,
        contour: 0.0,
        details: "",
        required: false,
    },
    [EmFile.Coordinates]: {
        nameFE: 'Coordinates',
        type: "co-cif",
        fileName: "",
        file: null,
        details: "",
        required: false,
    }
}

const CristallographyDepositionSet: { [f in CristallographyDeposition]: DepositionFiles } = {

        [EmFile.StructureFactors]:{
            nameFE: 'Structure Factors',
            type: "xs-cif",
            fileName: "",
            file: null,
            details: "",
            required: false,
        },
        [EmFile.MTZ]:{
            nameFE: 'MTZ',
            type: "xs-mtz",
            fileName: "",
            file: null,
            details: "",
            required: false,
        },
    }

export const MethodsList: EmMethod[] = [
    {
        value: EmType.Helical,
        viewValue: 'Helical',
        experiment: { type: "em", subtype: "helical" },
        files: {
            ...BasicDepositionSet, ...ExtendedDepositionSet,
        },
    },
    {
        value: EmType.SingleParticle,
        viewValue: 'Single Particle',
        experiment: { type: "em", subtype: "single" },
        files: {
            ...BasicDepositionSet, ...ExtendedDepositionSet,
        },
    },
    {
        value: EmType.SubtomogramAveraging,
        viewValue: 'Subtomogram Averaging',
        experiment: { type: "em", subtype: "subtomogram" },
        files: {
            ...BasicDepositionSet, ...ExtendedDepositionSet,
        },
    },
    {
        value: EmType.Tomogram,
        viewValue: 'Tomogram',
        experiment: { type: "em", subtype: "tomography" },
        files: BasicDepositionSet,
    },
    {
        value: EmType.ElectronCristallography,
        viewValue: 'Electron Crystallography',
        experiment: { type: "ec" },
        files: {
            ...BasicDepositionSet,
            ...ExtendedDepositionSet,
            ...CristallographyDepositionSet,
        }
    },
];

