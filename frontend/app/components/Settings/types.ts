// Settings/types.ts

export interface SettingsPayload {
    selectedTheme: string;
    themes: Settings;
}

interface MetaInformation {
    title: string;
    description: string;
}

export interface Settings {
    [key: string]: SettingsConfiguration;
}

export interface SettingsConfiguration {
    Customization: CustomizationSettings;
    Chat: ChatSettings;
}

// Setting Options

export interface CustomizationSettings extends MetaInformation {
    settings: {
        title: TextFieldSetting;
        subtitle: TextFieldSetting;
        intro_message: TextFieldSetting;
        placeholder_message: TextFieldSetting;
        image: ImageFieldSetting;
        primary_color: ColorSetting;
        secondary_color: ColorSetting;
        warning_color: ColorSetting;
        bg_color: ColorSetting;
        bg_alt_color: ColorSetting;
        text_color: ColorSetting;
        text_alt_color: ColorSetting;
        button_color: ColorSetting;
        button_hover_color: ColorSetting;
        bg_console: ColorSetting;
        text_console: ColorSetting;
        font: SelectSetting;
        theme: "light" | "dark";
    };
}

export interface ChatSettings extends MetaInformation {
    settings: {
        caching: CheckboxSetting;
        suggestion: CheckboxSetting;
        info_button: CheckboxSetting;
        max_document_size: NumberFieldSetting;
    };
}

// Setting Fields

export interface TextFieldSetting {
    type: "text";
    text: string;
    description: string;
}

export interface NumberFieldSetting {
    type: "number";
    value: number;
    description: string;
}

export interface ImageFieldSetting {
    type: "image";
    src: string;
    description: string;
}

export interface CheckboxSetting {
    type: "check";
    checked: boolean;
    description: string;
}

export interface ColorSetting {
    type: "color";
    color: string;
    description: string;
}

export interface SelectSetting {
    type: "select";
    options: string[];
    value: string;
    description: string;
}

// Base Settings

export const AvailableFonts: string[] = [
    "Inter",
    "Plus_Jakarta_Sans",
    "Open_Sans",
    "PT_Mono",
];

export const BaseFonts: SelectSetting = {
    value: "Plus_Jakarta_Sans",
    type: "select",
    options: AvailableFonts,
    description: "Text Font",
};

export const BaseSettings: Settings = {};
// Additional types from original types.ts
  
export type RAGResponse = {
    data: { RAG: RAGConfig; SETTING: SettingsPayload };
    error: string;
  };
  
  export type ImportResponse = {
    logging: ConsoleMessage[];
  };
  
  export type ConsoleMessage = {
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
    message: string;
  };
  
  export type FileData = {
    filename: string;
    extension: string;
    content: string;
  };
  
  export type RAGConfig = {
    [componentTitle: string]: RAGComponentClass;
  };
  
  export type RAGComponentClass = {
    selected: string;
    components: RAGComponent;
  };
  
  export type RAGComponent = {
    [key: string]: RAGComponentConfig;
  };
  
  export type RAGComponentConfig = {
    name: string;
    variables: string[];
    library: string[];
    description: string[];
    selected: string;
    config: RAGSetting;
    type: string;
    available: boolean;
  };
  
  export type RAGSetting = {
    [key: string]: TextFieldSetting | NumberFieldSetting;
  };