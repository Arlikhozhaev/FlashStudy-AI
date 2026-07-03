"use client";

import type { PlanName } from "@/lib/plans";
import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

interface PricingCardProps {
  name: PlanName;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  loading?: boolean;
  onSelect: () => void;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  loading = false,
  onSelect,
}: PricingCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: highlighted ? "primary.main" : "divider",
        boxShadow: highlighted ? "var(--shadow-card)" : "var(--shadow-soft)",
        transform: highlighted ? "translateY(-8px)" : "none",
        background: highlighted
          ? "linear-gradient(180deg, rgba(79,70,229,0.08), rgba(255,255,255,1))"
          : "background.paper",
      }}
    >
      {highlighted && (
        <Chip
          icon={<StarRoundedIcon />}
          label="Most Popular"
          color="primary"
          size="small"
          sx={{ position: "absolute", top: 16, right: 16 }}
        />
      )}

      <Typography variant="h5" fontWeight={800} gutterBottom>
        {name}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
        {price}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, minHeight: 48 }}>
        {description}
      </Typography>

      <List dense sx={{ mb: 3 }}>
        {features.map((feature) => (
          <ListItem key={feature} disableGutters sx={{ alignItems: "flex-start" }}>
            <ListItemIcon sx={{ minWidth: 32, mt: 0.3 }}>
              <CheckCircleRoundedIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Button
          fullWidth
          variant={highlighted ? "contained" : "outlined"}
          size="large"
          disabled={loading}
          onClick={onSelect}
        >
          {loading ? "Redirecting..." : "Choose Plan"}
        </Button>
      </Box>
    </Paper>
  );
}
