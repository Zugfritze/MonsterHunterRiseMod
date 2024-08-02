import { Character } from "./Character";
import { ItemBoxEdit } from "./ItemBoxEdit";
import { InfiniteConsumables } from "./InfiniteConsumables";
import { BuddySkillEdit } from "./BuddySkillEdit";
import { TalismanEdit } from "./TalismanEdit";
import { Debug } from "./Debug";
import { Other } from "./Other";
import { imgui_extra } from "./Tools/imgui_extra";
import ImGuiWindowFlags = imgui_extra.ImGuiWindowFlags;

class Main {
  static is_init: boolean = false;
  static font: FontIndex | undefined = undefined;
  static drawWindow: boolean = false;

  static init(): boolean {
    this.font = imgui.load_font("NotoSansSC-Bold.otf", 18, [0x1, 0xffff, 0]);
    if (this.font == undefined) {
      return false;
    }

    Character.init_hook();
    InfiniteConsumables.init_hook();
    Other.init_hook();

    return true;
  }

  static ui() {
    if (!this.is_init) {
      this.is_init = this.init();
    } else {
      imgui.push_font(this.font!);
      if (imgui.button("半瓶气水-MHR菜单")) {
        this.drawWindow = !this.drawWindow;
      }
      if (this.drawWindow) {
        if (imgui.begin_window("半瓶气水-MHR", true, ImGuiWindowFlags.AlwaysAutoResize)) {
          Character.ui();
          ItemBoxEdit.ui();
          InfiniteConsumables.ui();
          BuddySkillEdit.ui();
          TalismanEdit.ui();
          Other.ui();
          Debug.ui();
          imgui.end_window();
        } else {
          this.drawWindow = false;
        }
      }
      imgui.pop_font();
    }
  }
}

Main.init();

re.on_draw_ui(() => {
  Main.ui();
});
