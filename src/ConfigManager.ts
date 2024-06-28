export class ConfigManager {
  configPath: string;
  config: { [key: string]: any };
  defaultConfig: { [key: string]: any };

  constructor(configPath: string, defaultConfig: { [key: string]: any }) {
    this.configPath = configPath;
    this.config = { ...defaultConfig };
    this.defaultConfig = { ...defaultConfig };
    this.load();
  }

  load() {
    const configFile = json.load_file(this.configPath);
    if (configFile != null) {
      this.config = configFile;
    } else {
      this.save();
    }
  }

  save() {
    json.dump_file(this.configPath, this.config);
  }

  get(key: string): any {
    if (this.config[key] != undefined) {
      return this.config[key];
    } else {
      return this.defaultConfig[key];
    }
  }

  set(key: string, value: any) {
    if (this.config[key] != value) {
      this.config[key] = value;
      this.save();
    }
  }
}
