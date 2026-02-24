from langgraph.graph import StateGraph, END
from typing import Literal

from .state import AgentState
from .nodes import CodeParser_Node, BusinessValue_Node, Narrative_Node, Formatting_Node

def route_formatting(state: AgentState) -> Literal["Formatting_Node", "__end__"]:
    errors = state.get("errors", "")
    if errors:
        return "Formatting_Node"
    return "__end__"

def build_graph():
    graph_builder = StateGraph(AgentState)
    
    graph_builder.add_node("CodeParser_Node", CodeParser_Node)
    graph_builder.add_node("BusinessValue_Node", BusinessValue_Node)
    graph_builder.add_node("Narrative_Node", Narrative_Node)
    graph_builder.add_node("Formatting_Node", Formatting_Node)
    
    # Define flow: START -> CodeParser_Node -> BusinessValue_Node -> Narrative_Node -> Formatting_Node -> END
    graph_builder.set_entry_point("CodeParser_Node")
    graph_builder.add_edge("CodeParser_Node", "BusinessValue_Node")
    graph_builder.add_edge("BusinessValue_Node", "Narrative_Node")
    graph_builder.add_edge("Narrative_Node", "Formatting_Node")
    
    # Conditional edge for formatting validation
    graph_builder.add_conditional_edges(
        "Formatting_Node",
        route_formatting,
        {
            "Formatting_Node": "Formatting_Node",
            "__end__": END
        }
    )
    
    # Compile the graph
    app = graph_builder.compile()
    return app

graph_app = build_graph()
