#!/usr/bin/env python3
"""
Script to create a dependency flowchart from dependencies.json using graphviz
"""

import json
import graphviz
from pathlib import Path


def load_dependencies(json_file="../dependencies.json"):
    """Load dependencies from JSON file"""
    with open(json_file, "r") as f:
        return json.load(f)


def create_flowchart(dependencies, output_file="cuda_dependencies"):
    """Create a flowchart using graphviz"""

    # Create a new directed graph
    dot = graphviz.Digraph(comment="CUDA Ecosystem Dependencies")
    dot.attr(rankdir="TB")  # Top to bottom layout
    dot.attr("node", shape="box", style="rounded,filled", fontsize="10")
    dot.attr("graph", splines="curved", nodesep="0.3", ranksep="0.4", overlap="false")

    # Add all nodes first
    for component, info in dependencies.items():
        if info["official"]:
            # Official NVIDIA components in blue
            dot.node(
                component,
                component,
                fillcolor="lightblue",
                fontname="Arial",
                fontsize="10",
            )
        else:
            # Third-party components in light green
            dot.node(
                component,
                component,
                fillcolor="lightgreen",
                fontname="Arial",
                fontsize="10",
            )

    # Add edges for dependencies (reversed: component depends on dependency)
    for component, info in dependencies.items():
        for dependency in info["dependencies"]:
            if dependency in dependencies:
                # Dependency exists in our dataset
                dot.edge(component, dependency)
            else:
                # External dependency - add as a new node
                dot.node(
                    dependency,
                    dependency,
                    fillcolor="lightyellow",
                    fontname="Arial",
                    fontsize="10",
                )
                dot.edge(component, dependency)

    # Add legend
    with dot.subgraph(name="cluster_legend") as legend:
        legend.attr(label="Legend", fontsize="12", fontname="Arial Bold")
        legend.attr(
            "node", shape="box", style="rounded,filled", fontname="Arial", fontsize="9"
        )
        legend.node("legend_official", "Official NVIDIA", fillcolor="lightblue")
        legend.node("legend_third_party", "Third Party", fillcolor="lightgreen")
        legend.node("legend_external", "External Dependency", fillcolor="lightyellow")

    return dot


def main():
    """Main function"""
    print("Loading dependencies from dependencies.json...")
    dependencies = load_dependencies()

    print(f"Found {len(dependencies)} components")

    print("Creating flowchart...")
    dot = create_flowchart(dependencies)

    # Save as PNG only
    try:
        output_file = "cuda_dependencies_flowchart.png"
        dot.render("cuda_dependencies_flowchart", format="png", cleanup=True)
        print(f"Flowchart saved as {output_file}")
    except Exception as e:
        print(f"Failed to save PNG format: {e}")

    print("\nFlowchart generation complete!")
    print("Legend:")
    print("  - Light Blue: Official NVIDIA components")
    print("  - Light Green: Third-party components")
    print("  - Light Yellow: External dependencies")
    print(
        "\nNote: Arrows point from components to their dependencies (reversed from typical dependency graphs)"
    )


if __name__ == "__main__":
    main()
