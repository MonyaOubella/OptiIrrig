#  OptiIrrig — Système Intelligent d'Irrigation pour l'Agriculture Durable

> Projet réalisé dans le cadre du cours d'Entrepreneuriat — Filières GL · SE · IA/Data
> Région Souss Massa, Maroc

---

##  Description

OptiIrrig est une application cloud IoT qui aide les agriculteurs
de la région Souss Massa à optimiser leur consommation d'eau
d'irrigation grâce à des capteurs intelligents, une plateforme
web temps réel, un contrôle de pompe à distance et un modèle
d'IA prédictif.

---

##  Problème résolu

- L'agriculteur ne sait pas **quand** ni **combien** irriguer
- Les fuites d'eau sont **non détectées** et non localisées
- La pompe ne peut pas être **contrôlée à distance**
- Résultat : **gaspillage massif** d'une ressource rare

---

##  Équipe

| Nom | Filière | Rôle |
|-----|---------|------|
Monya OUBELLA -> Génie Logiciel | Architecture, Prototype, Design |
Soufiane TIDRARINI -> Systèmes Embarqués | Capteurs, ESP32, LoRaWAN |
Abdelouahd ID-BOUBRIK -> IA & Data | Modèle prédictif, Détection fuites |

---

##  Technologies

**Hardware:** ESP32 · LoRaWAN · MQTT · Capteurs (humidité, débit, pression)
**Software:** React · TypeScript · Vite · Laravel · Bootstrap
**IA/Data:** Python · Scikit-learn · Modèle de prédiction irrigation

---



##  Fonctionnalités du prototype

- Dashboard temps réel (humidité, débit, pression)
- Contrôle pompe à distance (ouvrir / fermer)
- Alertes fuites avec localisation
- Recommandation IA d'irrigation
- Historique de consommation
- Vue multi-exploitations (coopérative)
- Export rapport PDF

---

##  Structure du dépôt

```
OptiIrrig/
├── docs/
│   ├── design-thinking/
│   │   ├── personas.md
│   │   ├── problem-statement.md
│   │   └── user-stories.md
│   └── architecture/
│       └── architecture-globale.png
├── src/
│   └── app/
│       └── components/
│           └── PumpControl.tsx
├── README.md
└── package.json
```

---


## 📄 Licence
MIT — Projet académique
