import com.intellij.openapi.actionSystem.KeyboardShortcut
import com.intellij.openapi.keymap.ex.KeymapManagerEx

import javax.swing.*

def licho = KeymapManagerEx.getInstanceEx().getActiveKeymap()

class ShortKeyInfo {
    String name;
    List<KeyboardShortcut> shortCuts = new ArrayList<>();
}

def oneKeys = new ArrayList<ShortKeyInfo>()
def multiKeys = new ArrayList<ShortKeyInfo>()
def keys = new ArrayList<ShortKeyInfo>()

licho.getActionIdList().each {
    var name = it;
    var shortCuts = licho.getShortcuts(it).findAll {
        it instanceof KeyboardShortcut && it.firstKeyStroke != null
    }.collect { it as KeyboardShortcut }

    if (shortCuts.isEmpty()) {
        return
    }

    def shortKeyInfo = new ShortKeyInfo()
    shortKeyInfo.name = name
    shortKeyInfo.shortCuts = shortCuts
    if (shortCuts.size() == 1) {
        oneKeys.add(shortKeyInfo)
    } else {
        multiKeys.add(shortKeyInfo)
    }

    shortCuts.each {
        def ski = new ShortKeyInfo()
        ski.name = name
        ski.shortCuts[0] = it
        keys.add(ski)
    }

}

def modifierLen = (KeyStroke t) -> {
    t.toString().split("\\s")
}

def kk = (KeyStroke t) -> {
    t.toString().split("\\s").last()
}

def getModifiers = (KeyStroke t) -> {
    def modifiers = t.toString().split("pressed")[0]
    modifiers
}
def CTRL = "ctrl"
def ALT = "alt"
def SHIFT = "shift"
def META = "meta"

def compare = (KeyStroke aa, KeyStroke bb, String modifier) -> {
    if (getModifiers(aa).contains(modifier) && !getModifiers(bb).contains(modifier)) {
        -1
    } else if (!getModifiers(aa).contains(modifier) && getModifiers(bb).contains(modifier)) {
        1
    } else {
        0
    }
}

multiKeys.collectMany { it.shortCuts }

def a = keys.sort { x, y ->
    def a = x.shortCuts[0].firstKeyStroke
    def b = y.shortCuts[0].firstKeyStroke
    modifierLen(a).length <=> modifierLen(b).length
            ?: compare(a, b, CTRL)
            ?: compare(a, b, SHIFT)
            ?: compare(a, b, ALT)
            ?: compare(a, b, META)
            ?: kk(a).length() <=> kk(b).length()
            ?: kk(a) <=> kk(b)
}

def formatModifier = (ShortKeyInfo keyStr) -> {
    def sc = keyStr.shortCuts[0].firstKeyStroke
    def modifiers = getModifiers(sc)
    def result = new StringBuffer()
    if (modifiers.contains(CTRL)) {
        result << CTRL.padLeft(1 - result.length())
    }
    if (modifiers.contains(SHIFT)) {
        result << SHIFT.padLeft(12 - result.length())
    }
    if (modifiers.contains(ALT)) {
        result << ALT.padLeft(24 - result.length())
    }

    if (modifiers.contains(META)) {
        result << META.padLeft(36 - result.length())
    }

    result << kk(sc).padLeft(48 - result.length())
    if (keyStr.shortCuts[0].secondKeyStroke != null) {
        result << kk(keyStr.shortCuts[0].secondKeyStroke).padLeft(50 - result.length())
    }
    result.toString()
}

def last = ""
def head = new StringBuffer()
head << CTRL.padLeft(1 - head.length())
head << SHIFT.padLeft(12 - head.length())
head << ALT.padLeft(24 - head.length())
head << META.padLeft(36 - head.length())
head << "key".padLeft(48 - head.length())
println(head.toString())

a.each {
    def result = new StringBuffer()

    def cur = formatModifier(it)
    if (cur != last) {
        last = cur
        result << last
    }

    result << it.name.padLeft(64 - result.length() + it.name.length())
    println(result.toString())
}
print("\n")